import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, comparePassword, signAccessToken, verifyAccessToken, generateRefreshToken, getRefreshTokenExpiry, getTokenFromRequest } from "@/lib/auth-helpers";
import { streamAiResponse, generateAiReply } from "@/lib/ai-provider";
import { trackEvent, identifyUser, flushAnalytics } from "@/lib/analytics-server";

async function trackApiCall(method: string, path: string, userId: string | null, status: number, durationMs: number, extra?: Record<string, unknown>) {
  const id = userId || "anonymous";
  trackEvent(id, "api_call", {
    method,
    path: `/api/${path}`,
    status,
    duration_ms: durationMs,
    ...extra,
  });
}

type Handler = (req: NextRequest, segments: string[], params: Record<string, string>) => Promise<NextResponse>;

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function auth(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) throw new Error("Unauthorized");
  return verifyAccessToken(token);
}

function getBody(req: NextRequest) {
  return req.clone().json();
}

async function requireWorkspaceMember(userId: string, workspaceId: string) {
  const member = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
  if (!member) throw new Error("Not a workspace member");
  return member;
}

// ─── ROUTER ─────────────────────────────────────────────────────────────────

async function apiHandler(req: NextRequest, params: Promise<{ path?: string[] }>, handler: (req: NextRequest, segments: string[]) => Promise<NextResponse>) {
  const method = req.method;
  let segments: string[] = [];
  let userId: string | null = null;
  let status = 500;
  const start = Date.now();

  try {
    const resolved = await params;
    segments = resolved.path || [];

    try {
      const token = getTokenFromRequest(req);
      if (token) {
        const payload = verifyAccessToken(token);
        userId = payload.sub;
      }
    } catch {}

    const res = await handler(req, segments);
    status = res.status;

    const duration = Date.now() - start;
    const id = userId || "anonymous";
    trackEvent(id, "api_call", {
      method,
      path: `/api/${segments.join("/")}`,
      status,
      duration_ms: duration,
    });

    return res;
  } catch (e: any) {
    status = e.message === "Unauthorized" ? 401 : 500;
    const duration = Date.now() - start;
    const id = userId || "anonymous";
    trackEvent(id, "api_error", {
      method,
      path: `/api/${segments.join("/")}`,
      status,
      duration_ms: duration,
      error: e.message,
    });

    console.error("API Error:", e);
    return error(e.message || "Internal error", status);
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  return apiHandler(req, params, async (req, segments) => handleRequest(req, segments));
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  return apiHandler(req, params, async (req, segments) => handleRequest(req, segments));
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  return apiHandler(req, params, async (req, segments) => handleRequest(req, segments));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  return apiHandler(req, params, async (req, segments) => handleRequest(req, segments));
}

async function handleRequest(req: NextRequest, segments: string[]): Promise<NextResponse> {
  const method = req.method;
  const [s0, s1, s2, s3] = segments;

  // ── AUTH ────────────────────────────────────────────────────────────────
  if (s0 === "auth") {
    if (s1 === "signup" && method === "POST") {
      const { name, email, password } = await getBody(req);
      if (!name || !email || !password) return error("Name, email, and password required");

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return error("Email already registered", 409);

      const hashed = await hashPassword(password);
      const user = await prisma.user.create({
        data: { name, email, password: hashed },
      });

      const workspace = await prisma.workspace.create({
        data: {
          name: `${name}'s Workspace`,
          slug: email.split("@")[0] + "-" + Date.now().toString(36),
          members: { create: { userId: user.id, role: "OWNER" } },
        },
      });

      const plan = await prisma.subscriptionPlan.findFirst({ where: { code: "FREE" } });
      if (plan) {
        await prisma.workspaceSubscription.create({
          data: {
            workspaceId: workspace.id,
            planId: plan.id,
            status: "ACTIVE",
            currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          },
        });
      }

      const accessToken = signAccessToken(user.id, user.email);
      const refreshToken = generateRefreshToken();
      await prisma.session.create({
        data: { token: refreshToken, userId: user.id, expiresAt: getRefreshTokenExpiry() },
      });

      const { password: _, ...safeUser } = user;

      identifyUser(user.id, { email: user.email, name: user.name, workspace_id: workspace.id });
      trackEvent(user.id, "user_signed_up", { email: user.email, name: user.name });

      return json({ user: safeUser, accessToken, refreshToken }, 201);
    }

    if (s1 === "login" && method === "POST") {
      const { email, password } = await getBody(req);
      if (!email || !password) return error("Email and password required");

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return error("Invalid email or password", 401);

      const valid = await comparePassword(password, user.password);
      if (!valid) return error("Invalid email or password", 401);

      const accessToken = signAccessToken(user.id, user.email);
      const refreshToken = generateRefreshToken();
      await prisma.session.create({
        data: { token: refreshToken, userId: user.id, expiresAt: getRefreshTokenExpiry() },
      });

      const { password: _, ...safeUser } = user;

      trackEvent(user.id, "user_logged_in", { method: "email" });

      return json({ user: safeUser, accessToken, refreshToken });
    }

    if (s1 === "refresh" && method === "POST") {
      const { refreshToken } = await getBody(req);
      if (!refreshToken) return error("Refresh token required");

      const session = await prisma.session.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });
      if (!session || session.expiresAt < new Date()) return error("Invalid or expired refresh token", 401);

      const newAccessToken = signAccessToken(session.user.id, session.user.email);
      const newRefreshToken = generateRefreshToken();
      const newExpiry = getRefreshTokenExpiry();

      await prisma.$transaction([
        prisma.session.delete({ where: { id: session.id } }),
        prisma.session.create({
          data: { token: newRefreshToken, userId: session.user.id, expiresAt: newExpiry },
        }),
      ]);

      return json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    }

    if (s1 === "logout" && method === "POST") {
      const payload = await auth(req).catch(() => null);
      const uid = payload?.sub || "anonymous";
      const { refreshToken } = await getBody(req);
      if (refreshToken) {
        await prisma.session.deleteMany({ where: { token: refreshToken } });
      }
      trackEvent(uid, "user_logged_out");
      return json({ message: "Logged out" });
    }

    if (s1 === "google" && method === "GET") {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      if (!clientId) return error("Google OAuth not configured");
      const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || `http://localhost:${process.env.PORT || 4000}`;
      const redirectUri = `${backendUrl}/api/auth/google/callback`;
      const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email%20profile`;
      return NextResponse.redirect(url);
    }

    if (s1 === "google" && s2 === "callback" && method === "GET") {
      const code = req.nextUrl.searchParams.get("code");
      if (!code) return error("No code provided");
      return handleOAuthCallback("google", code, req);
    }

    if (s1 === "github" && method === "GET") {
      const clientId = process.env.GITHUB_CLIENT_ID;
      if (!clientId) return error("GitHub OAuth not configured");
      const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || `http://localhost:${process.env.PORT || 4000}`;
      const redirectUri = `${backendUrl}/api/auth/github/callback`;
      const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
      return NextResponse.redirect(url);
    }

    if (s1 === "github" && s2 === "callback" && method === "GET") {
      const code = req.nextUrl.searchParams.get("code");
      if (!code) return error("No code provided");
      return handleOAuthCallback("github", code, req);
    }

    return error("Auth route not found", 404);
  }

  // ── USERS ───────────────────────────────────────────────────────────────
  if (s0 === "users" && s1 === "me") {
    const payload = await auth(req);

    if (method === "GET") {
      const user = await prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) return error("User not found", 404);
      const { password, ...safeUser } = user;
      return json(safeUser);
    }

    if (method === "PATCH") {
      const body = await getBody(req);
      const user = await prisma.user.update({
        where: { id: payload.sub },
        data: body,
      });
      const { password, ...safeUser } = user;
      return json(safeUser);
    }

    return error("Method not allowed", 405);
  }

  // ── WORKSPACES ──────────────────────────────────────────────────────────
  if (s0 === "workspaces" && s1) {
    const payload = await auth(req);
    const workspaceId = s1;

    if (s2 === "members" && method === "GET") {
      await requireWorkspaceMember(payload.sub, workspaceId);
      const members = await prisma.workspaceMember.findMany({
        where: { workspaceId },
        include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      });
      return json(members);
    }

    if (s2 === "integrations" && method === "GET") {
      await requireWorkspaceMember(payload.sub, workspaceId);
      const integrations = await prisma.integration.findMany({ where: { workspaceId } });
      return json(integrations);
    }

    if (method === "GET") {
      await requireWorkspaceMember(payload.sub, workspaceId);
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        include: { members: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } } } },
      });
      if (!workspace) return error("Workspace not found", 404);
      return json(workspace);
    }

    return error("Workspace route not found", 404);
  }

  // ── CONTACTS ────────────────────────────────────────────────────────────
  if (s0 === "contacts") {
    const payload = await auth(req);
    const user = await prisma.user.findUnique({ where: { id: payload.sub }, include: { workspaceMemberships: true } });
    const wsId = user?.workspaceMemberships[0]?.workspaceId;
    if (!wsId) return error("No workspace found", 404);

    if (s1 && method === "DELETE") {
      await prisma.contact.delete({ where: { id: s1 } });
      return json({ message: "Deleted" });
    }

    if (s1 && method === "GET") {
      const contact = await prisma.contact.findUnique({ where: { id: s1 } });
      return json(contact);
    }

    if (method === "GET") {
      const search = req.nextUrl.searchParams.get("search") || "";
      const contacts = await prisma.contact.findMany({
        where: {
          workspaceId: wsId,
          ...(search ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      return json(contacts);
    }

    if (method === "POST") {
      const body = await getBody(req);
      const contact = await prisma.contact.create({
        data: { ...body, workspaceId: wsId },
      });
      trackEvent(payload.sub, "contact_created", { contact_id: contact.id, name: contact.name });
      return json(contact, 201);
    }

    return error("Method not allowed", 405);
  }

  // ── PIPELINES ───────────────────────────────────────────────────────────
  if (s0 === "pipelines") {
    const payload = await auth(req);
    const user = await prisma.user.findUnique({ where: { id: payload.sub }, include: { workspaceMemberships: true } });
    const wsId = user?.workspaceMemberships[0]?.workspaceId;
    if (!wsId) return error("No workspace found", 404);

    if (method === "GET") {
      const pipelines = await prisma.pipeline.findMany({ where: { workspaceId: wsId } });
      return json(pipelines);
    }

    return error("Method not allowed", 405);
  }

  // ── DEALS ───────────────────────────────────────────────────────────────
  if (s0 === "deals") {
    const payload = await auth(req);
    const user = await prisma.user.findUnique({ where: { id: payload.sub }, include: { workspaceMemberships: true } });
    const wsId = user?.workspaceMemberships[0]?.workspaceId;
    if (!wsId) return error("No workspace found", 404);

    if (s1 === "stats" && s2 && method === "GET") {
      const pipelineId = s2;
      const stages = await prisma.deal.groupBy({
        by: ["stageId"],
        where: { pipelineId, workspaceId: wsId },
        _sum: { value: true },
        _count: true,
      });
      return json(stages);
    }

    if (s1 && s2 === "move" && method === "PATCH") {
      const { stageId, order } = await getBody(req);
      await prisma.deal.update({ where: { id: s1 }, data: { stageId, order } });
      return json({ message: "Moved" });
    }

    if (s1 && method === "GET") {
      const deal = await prisma.deal.findUnique({ where: { id: s1 } });
      return json(deal);
    }

    if (s1 && method === "PATCH") {
      const body = await getBody(req);
      const deal = await prisma.deal.update({ where: { id: s1 }, data: body });
      return json(deal);
    }

    if (method === "GET") {
      const pipelineId = req.nextUrl.searchParams.get("pipelineId");
      const where: any = { workspaceId: wsId };
      if (pipelineId) where.pipelineId = pipelineId;
      const deals = await prisma.deal.findMany({ where, orderBy: { order: "asc" } });
      return json(deals);
    }

    if (method === "POST") {
      const body = await getBody(req);
      let pipeline = await prisma.pipeline.findFirst({ where: { workspaceId: wsId } });
      if (!pipeline) {
        const defaultStages = JSON.stringify([{ id: "new", name: "New", order: 0 }]);
        pipeline = await prisma.pipeline.create({
          data: { name: "Default Pipeline", workspaceId: wsId, stages: defaultStages },
        });
      }
      const pipelineStages: any[] = JSON.parse(pipeline.stages || "[]");
      const stage = pipelineStages[0] || { id: "new", name: "New" };
      const maxOrder = await prisma.deal.aggregate({ where: { workspaceId: wsId }, _max: { order: true } });
      const deal = await prisma.deal.create({
        data: {
          name: body.title || body.name || "Untitled Deal",
          title: body.title || body.name || "Untitled Deal",
          value: body.value || 0,
          stageId: stage.id,
          pipelineId: pipeline.id,
          workspaceId: wsId,
          order: (maxOrder._max.order || 0) + 1,
        },
      });
      trackEvent(payload.sub, "deal_created", { deal_id: deal.id, pipeline_id: deal.pipelineId, value: deal.value });
      return json(deal, 201);
    }

    return error("Method not allowed", 405);
  }

  // ── KNOWLEDGE BASE ──────────────────────────────────────────────────────
  if (s0 === "knowledge-base") {
    const payload = await auth(req);
    const user = await prisma.user.findUnique({ where: { id: payload.sub }, include: { workspaceMemberships: true } });
    const wsId = user?.workspaceMemberships[0]?.workspaceId;
    if (!wsId) return error("No workspace found", 404);

    if (s1 && method === "DELETE") {
      await prisma.knowledgeArticle.delete({ where: { id: s1 } });
      return json({ message: "Deleted" });
    }

    if (s1 && method === "PATCH") {
      const body = await getBody(req);
      const article = await prisma.knowledgeArticle.update({ where: { id: s1 }, data: body });
      return json(article);
    }

    if (method === "GET") {
      const search = req.nextUrl.searchParams.get("search") || "";
      const articles = await prisma.knowledgeArticle.findMany({
        where: {
          workspaceId: wsId,
          ...(search ? { title: { contains: search } } : {}),
        },
        orderBy: { createdAt: "desc" },
      });
      return json(articles);
    }

    if (method === "POST") {
      const body = await getBody(req);
      const article = await prisma.knowledgeArticle.create({
        data: {
          title: body.title || "Untitled",
          content: body.content || "",
          tags: body.tags || "",
          workspaceId: wsId,
        },
      });
      return json(article, 201);
    }

    return error("Method not allowed", 405);
  }

  // ── AI AGENTS ───────────────────────────────────────────────────────────
  if (s0 === "ai-agents") {
    const payload = await auth(req);
    const user = await prisma.user.findUnique({ where: { id: payload.sub }, include: { workspaceMemberships: true } });
    const wsId = user?.workspaceMemberships[0]?.workspaceId;
    if (!wsId) return error("No workspace found", 404);

    if (s1 && s2 === "execute" && method === "POST") {
      const { input } = await getBody(req);
      const agent = await prisma.aiAgent.findUnique({ where: { id: s1 } });
      if (!agent) return error("Agent not found", 404);

      const execution = await prisma.aiAgentExecution.create({
        data: { agentId: s1, triggeredBy: payload.sub, input, status: "RUNNING", startedAt: new Date() },
      });

      try {
        const reply = await generateAiReply([
          { role: "system", content: agent.systemPrompt },
          { role: "user", content: input },
        ]);
        await prisma.aiAgentExecution.update({
          where: { id: execution.id },
          data: { output: reply, status: "COMPLETED", completedAt: new Date() },
        });
        return json({ output: reply });
      } catch {
        await prisma.aiAgentExecution.update({
          where: { id: execution.id },
          data: { status: "FAILED", completedAt: new Date() },
        });
        return error("AI execution failed", 500);
      }
    }

    if (s1 && method === "PATCH") {
      const body = await getBody(req);
      const agent = await prisma.aiAgent.update({ where: { id: s1 }, data: body });
      return json(agent);
    }

    if (method === "GET") {
      const agents = await prisma.aiAgent.findMany({ where: { workspaceId: wsId } });
      return json(agents);
    }

    if (method === "POST") {
      const body = await getBody(req);
      const agent = await prisma.aiAgent.create({ data: { ...body, workspaceId: wsId } });
      return json(agent, 201);
    }

    return error("Method not allowed", 405);
  }

  // ── AI CHAT ─────────────────────────────────────────────────────────────
  if (s0 === "ai-chat") {
    const payload = await auth(req);
    const user = await prisma.user.findUnique({ where: { id: payload.sub }, include: { workspaceMemberships: true } });
    const wsId = user?.workspaceMemberships[0]?.workspaceId;
    if (!wsId) return error("No workspace found", 404);

    if (s2 === "stream" && method === "POST") {
      const { content, model } = await getBody(req);

      const chat = await prisma.aiChat.findUnique({ where: { id: s1 } });
      if (!chat) return error("Chat not found", 404);

      await prisma.aiChatMessage.create({
        data: { chatId: s1, role: "user", content: content || "", metadata: model ? JSON.stringify({ model }) : undefined },
      });

      const messages = await prisma.aiChatMessage.findMany({
        where: { chatId: s1 },
        orderBy: { createdAt: "asc" },
      });

      const aiMessages = messages.map((m: any) => ({
        role: m.role as "system" | "user" | "assistant",
        content: m.content,
      }));

      const aiRes = await streamAiResponse(aiMessages);
      if (!aiRes.body) return error("No response from AI");

      let fullContent = "";

      const stream = new ReadableStream({
        async start(controller) {
          const reader = aiRes.body!.getReader();
          const decoder = new TextDecoder();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const text = decoder.decode(value, { stream: true });
            fullContent += text;
            controller.enqueue(value);
          }
          await prisma.aiChatMessage.create({
            data: { chatId: s1, role: "assistant", content: fullContent },
          });
          controller.close();
        },
      });

      return new NextResponse(stream, {
        headers: { "Content-Type": "text/plain", "Cache-Control": "no-cache" },
      });
    }

    if (s1 && s2 === "messages" && method === "GET") {
      const messages = await prisma.aiChatMessage.findMany({
        where: { chatId: s1 },
        orderBy: { createdAt: "asc" },
      });
      return json(messages);
    }

    if (s1 && method === "DELETE") {
      await prisma.$transaction([
        prisma.aiChatMessage.deleteMany({ where: { chatId: s1 } }),
        prisma.aiChat.delete({ where: { id: s1 } }),
      ]);
      return json({ message: "Deleted" });
    }

    if (method === "GET") {
      const chats = await prisma.aiChat.findMany({
        where: { workspaceId: wsId, userId: payload.sub },
        orderBy: { updatedAt: "desc" },
      });
      return json(chats);
    }

    if (method === "POST") {
      const { title, systemPrompt, message } = await getBody(req);
      const chat = await prisma.aiChat.create({
        data: { title: title || "New Chat", systemPrompt, workspaceId: wsId, userId: payload.sub },
      });
      if (message) {
        await prisma.aiChatMessage.create({
          data: { chatId: chat.id, role: "user", content: message },
        });
        const aiRes = await generateAiReply([
          ...(systemPrompt ? [{ role: "system" as const, content: systemPrompt }] : []),
          { role: "user", content: message },
        ]);
        await prisma.aiChatMessage.create({
          data: { chatId: chat.id, role: "assistant", content: aiRes },
        });
      }
      const messages = await prisma.aiChatMessage.findMany({
        where: { chatId: chat.id },
        orderBy: { createdAt: "asc" },
      });
      return json({ chat, messages }, 201);
    }

    return error("Method not allowed", 405);
  }

  // ── ADMIN ───────────────────────────────────────────────────────────────
  if (s0 === "admin") {
    const payload = await auth(req);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user?.isSuperAdmin) return error("Forbidden", 403);

    if (s1 === "health" && method === "GET") {
      return json({
        status: "healthy",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: "connected",
      });
    }

    if (s1 === "dashboard" && method === "GET") {
      const [users, workspaces, conversations] = await Promise.all([
        prisma.user.count(),
        prisma.workspace.count(),
        prisma.conversation.count(),
      ]);
      return json({ stats: { users, workspaces, conversations } });
    }

    if (s1 === "setup" && method === "POST") {
      const { email } = await getBody(req);
      const admin = await prisma.user.update({
        where: { email },
        data: { role: "ADMIN", isSuperAdmin: true },
      });
      const { password, ...safeUser } = admin;
      return json({ message: "Admin setup complete", user: safeUser });
    }

    if (s1 === "users" && !s2 && method === "GET") {
      const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
      const search = req.nextUrl.searchParams.get("search") || "";
      const take = 20;
      const skip = (page - 1) * take;
      const where = search ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] } : {};
      const [users, total] = await Promise.all([
        prisma.user.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
        prisma.user.count({ where }),
      ]);
      return json({ users: users.map(({ password, ...u }) => u), total, page, totalPages: Math.ceil(total / take) });
    }

    if (s1 === "users" && s2 && method === "GET") {
      const u = await prisma.user.findUnique({ where: { id: s2 } });
      if (!u) return error("User not found", 404);
      const { password, ...safeUser } = u;
      return json(safeUser);
    }

    if (s1 === "users" && s2 && method === "PATCH") {
      const body = await getBody(req);
      const u = await prisma.user.update({ where: { id: s2 }, data: body });
      const { password, ...safeUser } = u;
      return json(safeUser);
    }

    if (s1 === "users" && s2 && s3 === "super-admin" && method === "POST") {
      const u = await prisma.user.update({ where: { id: s2 }, data: { isSuperAdmin: true } });
      const { password, ...safeUser } = u;
      return json(safeUser);
    }

    if (s1 === "users" && s2 && s3 === "super-admin" && method === "DELETE") {
      const u = await prisma.user.update({ where: { id: s2 }, data: { isSuperAdmin: false } });
      const { password, ...safeUser } = u;
      return json(safeUser);
    }

    if (s1 === "workspaces" && !s2 && method === "GET") {
      const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
      const search = req.nextUrl.searchParams.get("search") || "";
      const take = 20;
      const skip = (page - 1) * take;
      const where = search ? { name: { contains: search } } : {};
      const [workspaces, total] = await Promise.all([
        prisma.workspace.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
        prisma.workspace.count({ where }),
      ]);
      return json({ workspaces, total, page, totalPages: Math.ceil(total / take) });
    }

    if (s1 === "workspaces" && s2 && method === "GET") {
      const workspace = await prisma.workspace.findUnique({ where: { id: s2 }, include: { members: true } });
      if (!workspace) return error("Workspace not found", 404);
      return json(workspace);
    }

    if (s1 === "workspaces" && s2 && method === "PATCH") {
      const body = await getBody(req);
      const workspace = await prisma.workspace.update({ where: { id: s2 }, data: body });
      return json(workspace);
    }

    if (s1 === "workspaces" && s2 && method === "DELETE") {
      await prisma.workspace.delete({ where: { id: s2 } });
      return json({ message: "Deleted" });
    }

    if (s1 === "feature-flags") {
      if (method === "GET") {
        const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
        const take = 20;
        const skip = (page - 1) * take;
        const [flags, total] = await Promise.all([
          prisma.featureFlag.findMany({ skip, take, orderBy: { createdAt: "desc" } }),
          prisma.featureFlag.count(),
        ]);
        return json({ flags, total, page, totalPages: Math.ceil(total / take) });
      }
      if (method === "POST" && !s2) {
        const body = await getBody(req);
        const flag = await prisma.featureFlag.create({ data: body });
        return json(flag, 201);
      }
      if (s2 === "toggle" && method === "POST") {
        const flag = await prisma.featureFlag.findUnique({ where: { id: s3 } });
        if (!flag) return error("Flag not found", 404);
        const updated = await prisma.featureFlag.update({ where: { id: s3 }, data: { enabled: !flag.enabled } });
        return json(updated);
      }
      if (s2 && method === "DELETE") {
        await prisma.featureFlag.delete({ where: { id: s2 } });
        return json({ message: "Deleted" });
      }
    }

    if (s1 === "audit" && method === "GET") {
      const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
      const take = 20;
      const skip = (page - 1) * take;
      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          skip,
          take,
          orderBy: { createdAt: "desc" },
          include: { user: { select: { name: true, email: true } } },
        }),
        prisma.auditLog.count(),
      ]);
      return json({ logs, total, page, totalPages: Math.ceil(total / take) });
    }

    return error("Admin route not found", 404);
  }

  // ── 404 ─────────────────────────────────────────────────────────────────
  return error(`Route /api/${segments.join("/")} not found`, 404);
}

// ─── OAUTH CALLBACK HANDLER ────────────────────────────────────────────────

async function handleOAuthCallback(provider: string, code: string, req: NextRequest): Promise<NextResponse> {
  try {
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || `http://localhost:${process.env.PORT || 4000}`;
    const frontendUrl = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    let email = "";
    let name = "";
    let avatarUrl = "";

    if (provider === "google") {
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: `${backendUrl}/api/auth/google/callback`,
          grant_type: "authorization_code",
        }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) return NextResponse.redirect(`${frontendUrl}/login?error=oauth-failed&details=${encodeURIComponent(tokenData.error || "Google token exchange failed")}`);

      const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const profile = await profileRes.json();
      email = profile.email;
      name = profile.name;
      avatarUrl = profile.picture || "";
    }

    if (provider === "github") {
      const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          code,
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          redirect_uri: `${backendUrl}/api/auth/github/callback`,
        }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) return NextResponse.redirect(`${frontendUrl}/login?error=oauth-failed&details=${encodeURIComponent(tokenData.error || "GitHub token exchange failed")}`);

      const profileRes = await fetch("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const profile = await profileRes.json();
      const emailRes = await fetch("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const emails = await emailRes.json();
      const primaryEmail = Array.isArray(emails) ? emails.find((e: any) => e.primary)?.email || emails[0]?.email : null;
      email = primaryEmail || `${profile.login}@github.user`;
      name = profile.name || profile.login;
      avatarUrl = profile.avatar_url || "";
    }

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const randomPass = await hashPassword(Math.random().toString(36) + Date.now());
      user = await prisma.user.create({
        data: { email, name, password: randomPass, avatarUrl },
      });
    }

    const accessToken = signAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken();
    await prisma.session.create({
      data: { token: refreshToken, userId: user.id, expiresAt: getRefreshTokenExpiry() },
    });

    return NextResponse.redirect(`${frontendUrl}/oauth-callback?token=${accessToken}&refreshToken=${refreshToken}`);
  } catch (e: any) {
    const frontendUrl = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${frontendUrl}/login?error=oauth-failed&details=${encodeURIComponent(e.message || "Unknown error")}`);
  }
}
