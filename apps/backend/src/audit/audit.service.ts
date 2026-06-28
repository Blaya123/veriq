import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(params: {
    action: string;
    entity: string;
    entityId?: string;
    userId?: string;
    workspaceId?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        userId: params.userId,
        workspaceId: params.workspaceId,
        metadata: (params.metadata ?? undefined) as any,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  }

  async query(params: {
    userId?: string;
    workspaceId?: string;
    action?: string;
    entity?: string;
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      userId, workspaceId, action, entity, dateFrom, dateTo,
      page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * limit;
    const where: Prisma.AuditLogWhereInput = {};

    if (userId) where.userId = userId;
    if (workspaceId) where.workspaceId = workspaceId;
    if (action) where.action = { contains: action };
    if (entity) where.entity = entity;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    const orderBy: Prisma.AuditLogOrderByWithRelationInput = {};
    orderBy[sortBy as keyof Prisma.AuditLogOrderByWithRelationInput] = sortOrder;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true, avatarUrl: true } },
          workspace: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getDistinctActions(): Promise<string[]> {
    const result = await this.prisma.auditLog.findMany({
      select: { action: true },
      distinct: ['action'],
      orderBy: { action: 'asc' },
    });
    return result.map((r) => r.action);
  }
}
