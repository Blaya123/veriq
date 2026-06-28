import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class FeatureFlagService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    enabled?: boolean;
  }) {
    const { page = 1, limit = 50, search, enabled } = params;
    const skip = (page - 1) * limit;
    const where: Prisma.FeatureFlagWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { key: { contains: search } },
      ];
    }

    if (enabled !== undefined) where.enabled = enabled;

    const [flags, total] = await Promise.all([
      this.prisma.featureFlag.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.featureFlag.count({ where }),
    ]);

    return { data: flags, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findByKey(key: string) {
    const flag = await this.prisma.featureFlag.findUnique({ where: { key } });
    if (!flag) throw new NotFoundException(`Feature flag '${key}' not found`);
    return flag;
  }

  async isEnabled(key: string, workspaceId?: string): Promise<boolean> {
    const flag = await this.prisma.featureFlag.findUnique({ where: { key } });
    if (!flag) return false;
    if (!flag.enabled) return false;

    if (flag.workspaceTargeting && workspaceId) {
      const targets: string[] = JSON.parse(flag.workspaceTargeting);
      if (Array.isArray(targets) && targets.length > 0) {
        return targets.includes(workspaceId);
      }
    }

    return true;
  }

  async create(data: {
    name: string;
    key: string;
    description?: string;
    enabled?: boolean;
    workspaceTargeting?: string[];
  }) {
    const existing = await this.prisma.featureFlag.findUnique({ where: { key: data.key } });
    if (existing) throw new ConflictException(`Feature flag with key '${data.key}' already exists`);

    return this.prisma.featureFlag.create({
      data: {
        name: data.name,
        key: data.key,
        description: data.description,
        enabled: data.enabled ?? false,
        workspaceTargeting: JSON.stringify(data.workspaceTargeting ?? []),
      },
    });
  }

  async update(id: string, data: {
    name?: string;
    description?: string;
    enabled?: boolean;
    workspaceTargeting?: string[];
  }) {
    const flag = await this.prisma.featureFlag.findUnique({ where: { id } });
    if (!flag) throw new NotFoundException('Feature flag not found');

    return this.prisma.featureFlag.update({
      where: { id },
      data: {
        ...data,
        workspaceTargeting: data.workspaceTargeting ? JSON.stringify(data.workspaceTargeting) : undefined,
      },
    });
  }

  async toggle(id: string) {
    const flag = await this.prisma.featureFlag.findUnique({ where: { id } });
    if (!flag) throw new NotFoundException('Feature flag not found');

    return this.prisma.featureFlag.update({
      where: { id },
      data: { enabled: !flag.enabled },
    });
  }

  async delete(id: string) {
    const flag = await this.prisma.featureFlag.findUnique({ where: { id } });
    if (!flag) throw new NotFoundException('Feature flag not found');

    await this.prisma.featureFlag.delete({ where: { id } });
    return { message: 'Feature flag deleted successfully' };
  }
}
