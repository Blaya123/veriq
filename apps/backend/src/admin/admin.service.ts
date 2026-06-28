import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { Prisma } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      totalWorkspaces,
      totalInvoices,
      paidInvoices,
      recentUsers,
      workspacePlanCounts,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.workspace.count(),
      this.prisma.invoice.count(),
      this.prisma.invoice.count({ where: { status: 'PAID' } }),
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true, isActive: true },
      }),
      this.prisma.workspace.groupBy({
        by: ['plan'],
        _count: true,
      }),
    ]);

    const revenue = await this.prisma.invoice.aggregate({
      _sum: { amount: true },
      where: { status: 'PAID' },
    });

    const totalRevenue = revenue._sum.amount ?? 0;
    const activeSubscriptions = paidInvoices;
    const mrr = Math.round(totalRevenue / 12);
    const arr = Math.round(totalRevenue);

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthUsers = await this.prisma.user.count({
      where: { createdAt: { lt: lastMonth } },
    });

    const growth = lastMonthUsers > 0
      ? Math.round(((totalUsers - lastMonthUsers) / lastMonthUsers) * 100)
      : 0;

    const planDistribution: Record<string, number> = {};
    workspacePlanCounts.forEach((w) => {
      planDistribution[w.plan] = w._count;
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const revenueChart = await this.prisma.$queryRaw<
      Array<{ date: string; amount: number }>
    >`
      SELECT
        DATE("createdAt") as date,
        SUM("amount") as amount
      FROM "Invoice"
      WHERE "status" = 'PAID' AND "createdAt" >= ${thirtyDaysAgo}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

      const systemHealth = await this.getBasicHealth();

    return {
      totalUsers,
      activeUsers,
      totalWorkspaces,
      totalRevenue,
      mrr,
      arr,
      activeSubscriptions,
      growth,
      planDistribution,
      recentUsers,
      revenueChart,
      systemHealth,
    };
  }

  private async getBasicHealth() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy', database: 'connected', timestamp: new Date().toISOString() };
    } catch {
      return { status: 'degraded', database: 'error', timestamp: new Date().toISOString() };
    }
  }

  async listUsers(params: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { search, role, status, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    if (role) {
      where.role = role as any;
    }

    if (status === 'active') where.isActive = true;
    else if (status === 'suspended') where.isActive = false;

    const orderBy: Prisma.UserOrderByWithRelationInput = {};
    orderBy[sortBy as keyof Prisma.UserOrderByWithRelationInput] = sortOrder;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          isSuperAdmin: true,
          avatarUrl: true,
          createdAt: true,
          _count: { select: { workspaceMemberships: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        isActive: u.isActive,
        isSuperAdmin: u.isSuperAdmin,
        avatarUrl: u.avatarUrl,
        createdAt: u.createdAt,
        workspacesCount: u._count.workspaceMemberships,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserDetail(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        isSuperAdmin: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        workspaceMemberships: {
          include: {
            workspace: { select: { id: true, name: true, slug: true, plan: true } },
          },
        },
        _count: {
          select: {
            conversations: true,
            assignedTasks: true,
            assignedDeals: true,
            aiChats: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUser(userId: string, dto: UpdateUserDto, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });

    const changes: string[] = [];
    if (dto.isActive !== undefined) {
      changes.push(`status changed to ${dto.isActive ? 'active' : 'suspended'}`);
    }
    if (dto.role) {
      changes.push(`role changed to ${dto.role}`);
    }
    if (dto.isSuperAdmin !== undefined) {
      changes.push(`super admin ${dto.isSuperAdmin ? 'granted' : 'revoked'}`);
    }

    await this.audit.log({
      action: 'USER_UPDATED',
      entity: 'User',
      entityId: userId,
      userId: adminId,
      metadata: { changes: changes.join(', '), previous: { role: user.role, isActive: user.isActive } },
    });

    const { password, ...safe } = updated;
    return safe;
  }

  async listWorkspaces(params: {
    search?: string;
    plan?: string;
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { search, plan, status, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.WorkspaceWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
      ];
    }

    if (plan) where.plan = plan as any;
    if (status === 'active') where.members = { some: {} };
    else if (status === 'empty') where.members = { none: {} };

    const orderBy: Prisma.WorkspaceOrderByWithRelationInput = {};
    orderBy[sortBy as keyof Prisma.WorkspaceOrderByWithRelationInput] = sortOrder;

    const [workspaces, total] = await Promise.all([
      this.prisma.workspace.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          plan: true,
          logoUrl: true,
          createdAt: true,
          _count: { select: { members: true, contacts: true, conversations: true, invoices: true } },
          members: {
            take: 1,
            where: { role: 'OWNER' },
            include: { user: { select: { id: true, name: true, email: true } } },
          },
        },
      }),
      this.prisma.workspace.count({ where }),
    ]);

    return {
      data: workspaces.map((w) => ({
        id: w.id,
        name: w.name,
        slug: w.slug,
        plan: w.plan,
        logoUrl: w.logoUrl,
        createdAt: w.createdAt,
        owner: w.members[0]?.user ?? null,
        membersCount: w._count.members,
        contactsCount: w._count.contacts,
        conversationsCount: w._count.conversations,
        invoicesCount: w._count.invoices,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getWorkspaceDetail(workspaceId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } } },
        },
        _count: {
          select: {
            contacts: true,
            conversations: true,
            deals: true,
            tasks: true,
            aiAgents: true,
            invoices: true,
            pipelines: true,
          },
        },
      },
    });

    if (!workspace) throw new NotFoundException('Workspace not found');
    return workspace;
  }

  async updateWorkspace(workspaceId: string, data: { name?: string; plan?: string }, adminId: string) {
    const workspace = await this.prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) throw new NotFoundException('Workspace not found');

    const updated = await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: data as any,
    });

    await this.audit.log({
      action: 'WORKSPACE_UPDATED',
      entity: 'Workspace',
      entityId: workspaceId,
      userId: adminId,
      metadata: { changes: data },
    });

    return updated;
  }

  async deleteWorkspace(workspaceId: string, adminId: string) {
    const workspace = await this.prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) throw new NotFoundException('Workspace not found');

    await this.prisma.workspace.delete({ where: { id: workspaceId } });

    await this.audit.log({
      action: 'WORKSPACE_DELETED',
      entity: 'Workspace',
      entityId: workspaceId,
      userId: adminId,
      metadata: { workspaceName: workspace.name },
    });

    return { message: 'Workspace deleted successfully' };
  }

  async setSuperAdmin(userId: string, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isSuperAdmin: true },
    });

    await this.audit.log({
      action: 'SUPER_ADMIN_GRANTED',
      entity: 'User',
      entityId: userId,
      userId: adminId,
    });

    const { password, ...safe } = updated;
    return safe;
  }

  async removeSuperAdmin(userId: string, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isSuperAdmin: false },
    });

    await this.audit.log({
      action: 'SUPER_ADMIN_REVOKED',
      entity: 'User',
      entityId: userId,
      userId: adminId,
    });

    const { password, ...safe } = updated;
    return safe;
  }

  async makeInitialSuperAdmin(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    const existingSuperAdmins = await this.prisma.user.count({ where: { isSuperAdmin: true } });
    if (existingSuperAdmins > 0) {
      throw new BadRequestException('Super admin already exists. Use the admin panel to manage admins.');
    }

    const updated = await this.prisma.user.update({
      where: { email },
      data: { isSuperAdmin: true },
    });

    await this.audit.log({
      action: 'INITIAL_SUPER_ADMIN_SETUP',
      entity: 'User',
      entityId: updated.id,
      userId: updated.id,
    });

    const { password, ...safe } = updated;
    return safe;
  }

  async getSystemHealth() {
    const start = Date.now();
    const dbHealthy = await this.checkDatabase();
    const responseTime = Date.now() - start;

    const uptime = process.uptime();

    return {
      status: dbHealthy ? 'healthy' : 'degraded',
      database: dbHealthy ? 'connected' : 'error',
      responseTime: `${responseTime}ms`,
      uptime: `${Math.floor(uptime)}s`,
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage(),
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
