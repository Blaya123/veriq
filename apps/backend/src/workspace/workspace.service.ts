import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole, SubscriptionStatus } from '../lib/prisma-enums';
import { PLAN_LIMITS } from '../subscription/subscription.service';

@Injectable()
export class WorkspaceService {
  constructor(private prisma: PrismaService) {}

  async create(
    data: { name: string; slug: string; logoUrl?: string },
    userId: string,
  ) {
    const existing = await this.prisma.workspace.findUnique({
      where: { slug: data.slug },
    });
    if (existing) throw new ConflictException('Slug already in use');

    const workspace = await this.prisma.workspace.create({
      data: {
        name: data.name,
        slug: data.slug,
        logoUrl: data.logoUrl,
        members: {
          create: { userId, role: UserRole.OWNER },
        },
      },
    });

    const freePlan = await this.prisma.subscriptionPlan.findUnique({
      where: { code: 'FREE' },
    });
    if (freePlan) {
      const periodEnd = new Date();
      periodEnd.setDate(periodEnd.getDate() + 30);
      await this.prisma.workspaceSubscription.create({
        data: {
          workspaceId: workspace.id,
          planId: freePlan.id,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: new Date(),
          currentPeriodEnd: periodEnd,
        },
      });
    }

    return workspace;
  }

  async getById(id: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
      include: { members: { include: { user: true } } },
    });
    if (!workspace) throw new NotFoundException('Workspace not found');
    return workspace;
  }

  async getBySlug(slug: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { slug },
      include: { members: { include: { user: true } } },
    });
    if (!workspace) throw new NotFoundException('Workspace not found');
    return workspace;
  }

  async update(
    id: string,
    data: { name?: string; logoUrl?: string; plan?: any },
  ) {
    const workspace = await this.prisma.workspace.update({
      where: { id },
      data,
    });
    return workspace;
  }

  async delete(id: string, userId: string) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId: id } },
    });
    if (!member || member.role !== UserRole.OWNER) {
      throw new ForbiddenException(
        'Only the workspace owner can delete the workspace',
      );
    }
    await this.prisma.workspace.delete({ where: { id } });
    return { message: 'Workspace deleted' };
  }

  async inviteMember(
    workspaceId: string,
    email: string,
    role: UserRole = UserRole.MEMBER,
  ) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    const existing = await this.prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: user.id, workspaceId } },
    });
    if (existing) throw new ConflictException('User is already a member');

    const subscription = await this.prisma.workspaceSubscription.findFirst({
      where: {
        workspaceId,
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] },
      },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });

    const planCode = subscription?.plan?.code || 'FREE';
    const limits = PLAN_LIMITS[planCode];
    if (limits) {
      const memberCount = await this.prisma.workspaceMember.count({
        where: { workspaceId },
      });
      if (memberCount >= limits.maxUsers) {
        throw new BadRequestException(
          `Plan limit reached: maximum ${limits.maxUsers} members allowed on ${planCode} plan. Please upgrade.`,
        );
      }
    }

    const member = await this.prisma.workspaceMember.create({
      data: { userId: user.id, workspaceId, role },
      include: { user: true },
    });
    return member;
  }

  async removeMember(workspaceId: string, userId: string) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    });
    if (!member) throw new NotFoundException('Member not found');

    await this.prisma.workspaceMember.delete({
      where: { userId_workspaceId: { userId, workspaceId } },
    });
    return { message: 'Member removed' };
  }

  async changeRole(workspaceId: string, userId: string, role: UserRole) {
    const member = await this.prisma.workspaceMember.update({
      where: { userId_workspaceId: { userId, workspaceId } },
      data: { role },
      include: { user: true },
    });
    return member;
  }
}
