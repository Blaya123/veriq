import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionStatus } from '../lib/prisma-enums';
import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  BillingInterval,
} from './dto/create-subscription.dto';

export const PLAN_LIMITS: Record<
  string,
  {
    maxUsers: number;
    maxWorkspaces: number;
    maxAiCredits: number;
    maxStorage: number;
    features: string[];
  }
> = {
  FREE: {
    maxUsers: 1,
    maxWorkspaces: 1,
    maxAiCredits: 50,
    maxStorage: 0.5,
    features: ['basic_inbox', 'basic_crm', 'email_integration'],
  },
  PRO: {
    maxUsers: 5,
    maxWorkspaces: 1,
    maxAiCredits: 1000,
    maxStorage: 10,
    features: [
      'basic_inbox',
      'basic_crm',
      'email_integration',
      'ai_reply',
      'ai_chat',
      'advanced_analytics',
      'api_access',
      'priority_support',
    ],
  },
  BUSINESS: {
    maxUsers: 50,
    maxWorkspaces: 3,
    maxAiCredits: 10000,
    maxStorage: 100,
    features: [
      'basic_inbox',
      'basic_crm',
      'email_integration',
      'ai_reply',
      'ai_chat',
      'advanced_analytics',
      'api_access',
      'priority_support',
      'advanced_ai_agents',
      'custom_workflows',
      'knowledge_base',
      'audit_logs',
      'team_collaboration',
    ],
  },
  ENTERPRISE: {
    maxUsers: 9999,
    maxWorkspaces: 99,
    maxAiCredits: 999999,
    maxStorage: 9999,
    features: ['all'],
  },
};

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  async getPlans() {
    return this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { priceMonthly: 'asc' },
    });
  }

  async getCurrentPlan(workspaceId: string) {
    const subscription = await this.prisma.workspaceSubscription.findFirst({
      where: {
        workspaceId,
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] },
      },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      const workspace = await this.prisma.workspace.findUnique({ where: { id: workspaceId } });
      if (!workspace) throw new NotFoundException('Workspace not found');

      const plan = await this.prisma.subscriptionPlan.findUnique({
        where: { code: workspace.plan },
      });
      if (!plan) throw new NotFoundException('Plan not found');

      return {
        subscription: null,
        plan,
        limits: PLAN_LIMITS[workspace.plan] || PLAN_LIMITS.FREE,
      };
    }

    return {
      subscription,
      plan: subscription.plan,
      limits: PLAN_LIMITS[subscription.plan.code] || PLAN_LIMITS.FREE,
    };
  }

  async createSubscription(workspaceId: string, dto: CreateSubscriptionDto) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { code: dto.planCode },
    });
    if (!plan || !plan.isActive) throw new NotFoundException('Plan not found');

    const existing = await this.prisma.workspaceSubscription.findFirst({
      where: {
        workspaceId,
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] },
      },
    });
    if (existing) throw new BadRequestException('Workspace already has an active subscription');

    const periodEnd = new Date();
    periodEnd.setDate(
      periodEnd.getDate() + (dto.billingInterval === BillingInterval.YEARLY ? 365 : 30),
    );

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    const subscription = await this.prisma.workspaceSubscription.create({
      data: {
        workspaceId,
        planId: plan.id,
        status: SubscriptionStatus.TRIALING,
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
        trialEndsAt,
      },
      include: { plan: true },
    });

    await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: { plan: plan.code as any },
    });

    return subscription;
  }

  async cancelSubscription(workspaceId: string) {
    const subscription = await this.prisma.workspaceSubscription.findFirst({
      where: {
        workspaceId,
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (!subscription) throw new NotFoundException('No active subscription found');

    const updated = await this.prisma.workspaceSubscription.update({
      where: { id: subscription.id },
      data: {
        status: SubscriptionStatus.CANCELED,
        canceledAt: new Date(),
      },
    });

    await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: { plan: 'FREE' as any },
    });

    return updated;
  }

  async upgradeDowngrade(workspaceId: string, dto: UpdateSubscriptionDto) {
    const newPlan = await this.prisma.subscriptionPlan.findUnique({
      where: { code: dto.planCode },
    });
    if (!newPlan || !newPlan.isActive) throw new NotFoundException('Plan not found');

    const subscription = await this.prisma.workspaceSubscription.findFirst({
      where: {
        workspaceId,
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] },
      },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });
    if (!subscription) throw new NotFoundException('No active subscription');

    const periodEnd = new Date();
    periodEnd.setDate(
      periodEnd.getDate() + (dto.billingInterval === BillingInterval.YEARLY ? 365 : 30),
    );

    const updated = await this.prisma.workspaceSubscription.update({
      where: { id: subscription.id },
      data: {
        planId: newPlan.id,
        currentPeriodEnd: periodEnd,
        status: SubscriptionStatus.ACTIVE,
      },
      include: { plan: true },
    });

    await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: { plan: newPlan.code as any },
    });

    return updated;
  }

  async checkLimit(
    workspaceId: string,
    resource: keyof Omit<typeof PLAN_LIMITS[string], 'features'>,
  ): Promise<boolean> {
    const { limits } = await this.getCurrentPlan(workspaceId);
    if (!limits) return false;

    switch (resource) {
      case 'maxUsers': {
        const count = await this.prisma.workspaceMember.count({
          where: { workspaceId },
        });
        return count < limits.maxUsers;
      }
      case 'maxWorkspaces': {
        return true;
      }
      case 'maxAiCredits': {
        return true;
      }
      case 'maxStorage': {
        return true;
      }
      default:
        return true;
    }
  }

  async checkFeatureAccess(workspaceId: string, feature: string): Promise<boolean> {
    const { limits } = await this.getCurrentPlan(workspaceId);
    if (!limits) return false;
    if (limits.features.includes('all')) return true;
    return limits.features.includes(feature);
  }

  async getUsageStats(workspaceId: string) {
    const { limits } = await this.getCurrentPlan(workspaceId);
    const memberCount = await this.prisma.workspaceMember.count({
      where: { workspaceId },
    });
    const aiAgentCount = await this.prisma.aiAgent.count({
      where: { workspaceId },
    });

    return {
      members: { used: memberCount, limit: limits?.maxUsers || 0 },
      aiAgents: { used: aiAgentCount, limit: limits?.maxUsers || 0 },
      storage: { used: 0, limit: limits?.maxStorage || 0 },
      aiCredits: { used: 0, limit: limits?.maxAiCredits || 0 },
    };
  }
}
