import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';

@Injectable()
export class DealService {
  constructor(private prisma: PrismaService) {}

  async create(workspaceId: string, dto: CreateDealDto) {
    return this.prisma.deal.create({
      data: {
        ...dto,
        expectedCloseDate: dto.expectedCloseDate
          ? new Date(dto.expectedCloseDate)
          : undefined,
        workspaceId,
      },
      include: {
        contact: true,
        assignedTo: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });
  }

  async findAll(workspaceId: string, pipelineId?: string) {
    const where: any = { workspaceId };
    if (pipelineId) where.pipelineId = pipelineId;
    return this.prisma.deal.findMany({
      where,
      include: {
        contact: true,
        assignedTo: { select: { id: true, name: true, email: true, avatarUrl: true } },
        _count: { select: { activities: true } },
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findById(id: string) {
    const deal = await this.prisma.deal.findUnique({
      where: { id },
      include: {
        contact: true,
        assignedTo: { select: { id: true, name: true, email: true, avatarUrl: true } },
        activities: {
          include: { createdBy: { select: { id: true, name: true, avatarUrl: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!deal) throw new NotFoundException('Deal not found');
    return deal;
  }

  async update(id: string, dto: UpdateDealDto) {
    await this.findById(id);
    return this.prisma.deal.update({
      where: { id },
      data: {
        ...dto,
        expectedCloseDate: dto.expectedCloseDate
          ? new Date(dto.expectedCloseDate)
          : undefined,
      },
      include: {
        contact: true,
        assignedTo: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.deal.delete({ where: { id } });
    return { message: 'Deal deleted' };
  }

  async moveDeal(id: string, stageId: string, order?: number) {
    await this.findById(id);
    const data: any = { stageId };
    if (order !== undefined) data.order = order;
    return this.prisma.deal.update({
      where: { id },
      data,
      include: {
        contact: true,
        assignedTo: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });
  }

  async getPipelineStats(workspaceId: string, pipelineId: string) {
    const deals = await this.prisma.deal.findMany({
      where: { workspaceId, pipelineId },
    });

    const totalDeals = deals.length;
    const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
    const wonDeals = deals.filter((d) => d.status === 'WON');
    const wonThisMonth = wonDeals.filter(
      (d) =>
        d.updatedAt.getMonth() === new Date().getMonth() &&
        d.updatedAt.getFullYear() === new Date().getFullYear(),
    ).length;
    const wonValue = wonDeals.reduce((sum, d) => sum + d.value, 0);
    const conversionRate =
      totalDeals > 0
        ? Math.round((wonDeals.length / totalDeals) * 100)
        : 0;

    const stageStats = deals.reduce(
      (acc, d) => {
        if (!acc[d.stageId]) acc[d.stageId] = { count: 0, value: 0 };
        acc[d.stageId].count++;
        acc[d.stageId].value += d.value;
        return acc;
      },
      {} as Record<string, { count: number; value: number }>,
    );

    return {
      totalDeals,
      totalValue,
      wonThisMonth,
      wonValue,
      conversionRate,
      stageStats,
    };
  }
}
