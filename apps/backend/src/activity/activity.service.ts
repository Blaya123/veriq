import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async create(dto: {
    workspaceId: string;
    type: 'NOTE' | 'CALL' | 'EMAIL' | 'MEETING' | 'TASK';
    subject: string;
    description?: string;
    contactId?: string;
    dealId?: string;
    createdById: string;
  }) {
    return this.prisma.activity.create({
      data: dto,
      include: {
        createdBy: { select: { id: true, name: true, avatarUrl: true } },
        contact: { select: { id: true, name: true } },
        deal: { select: { id: true, name: true } },
      },
    });
  }

  async findByContact(contactId: string) {
    return this.prisma.activity.findMany({
      where: { contactId },
      include: {
        createdBy: { select: { id: true, name: true, avatarUrl: true } },
        deal: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByDeal(dealId: string) {
    return this.prisma.activity.findMany({
      where: { dealId },
      include: {
        createdBy: { select: { id: true, name: true, avatarUrl: true } },
        contact: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByWorkspace(workspaceId: string, limit = 20) {
    return this.prisma.activity.findMany({
      where: { workspaceId },
      include: {
        createdBy: { select: { id: true, name: true, avatarUrl: true } },
        contact: { select: { id: true, name: true } },
        deal: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async delete(id: string) {
    const activity = await this.prisma.activity.findUnique({ where: { id } });
    if (!activity) throw new NotFoundException('Activity not found');
    await this.prisma.activity.delete({ where: { id } });
    return { message: 'Activity deleted' };
  }
}
