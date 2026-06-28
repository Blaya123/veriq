const AI_API_KEY = process.env.AI_API_KEY || "";
const AI_MODEL = process.env.AI_MODEL || "llama-3.1-8b-instant";
const AI_PROVIDER = process.env.AI_PROVIDER || "groq";

interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function streamAiResponse(messages: AiMessage[], signal?: AbortSignal): Promise<Response> {
  const baseUrl = AI_PROVIDER === "groq"
    ? "https://api.groq.com/openai/v1/chat/completions"
    : "https://openrouter.ai/api/v1/chat/completions";

  const apiKey = AI_PROVIDER === "groq" ? AI_API_KEY : process.env.OPENROUTER_API_KEY || AI_API_KEY;

  return fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...(AI_PROVIDER === "openrouter" ? { "HTTP-Referer": process.env.FRONTEND_URL || "" } : {}),
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 2048,
    }),
    signal,
  });
}

export async function generateAiReply(messages: AiMessage[]): Promise<string> {
  const baseUrl = AI_PROVIDER === "groq"
    ? "https://api.groq.com/openai/v1/chat/completions"
    : "https://openrouter.ai/api/v1/chat/completions";

  const apiKey = AI_PROVIDER === "groq" ? AI_API_KEY : process.env.OPENROUTER_API_KEY || AI_API_KEY;

  const res = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages,
      stream: false,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}
