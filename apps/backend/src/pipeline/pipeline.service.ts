import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePipelineDto, UpdatePipelineDto } from './dto/create-pipeline.dto';

@Injectable()
export class PipelineService {
  constructor(private prisma: PrismaService) {}

  async create(workspaceId: string, dto: CreatePipelineDto) {
    if (dto.isDefault) {
      await this.prisma.pipeline.updateMany({
        where: { workspaceId, isDefault: true },
        data: { isDefault: false },
      });
    }
    return this.prisma.pipeline.create({
      data: {
        name: dto.name,
        description: dto.description,
        stages: dto.stages as any,
        isDefault: dto.isDefault ?? false,
        workspaceId,
      },
    });
  }

  async findAll(workspaceId: string) {
    return this.prisma.pipeline.findMany({
      where: { workspaceId },
      include: {
        _count: { select: { deals: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(id: string) {
    const pipeline = await this.prisma.pipeline.findUnique({
      where: { id },
      include: {
        deals: {
          include: {
            contact: true,
            assignedTo: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
          orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        },
      },
    });
    if (!pipeline) throw new NotFoundException('Pipeline not found');
    return pipeline;
  }

  async update(id: string, dto: UpdatePipelineDto) {
    await this.findById(id);
    if (dto.isDefault) {
      const pipeline = await this.prisma.pipeline.findUnique({
        where: { id },
        select: { workspaceId: true },
      });
      await this.prisma.pipeline.updateMany({
        where: { workspaceId: pipeline!.workspaceId, isDefault: true },
        data: { isDefault: false },
      });
    }
    return this.prisma.pipeline.update({
      where: { id },
      data: {
        ...dto,
        stages: dto.stages ? (dto.stages as any) : undefined,
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.deal.deleteMany({ where: { pipelineId: id } });
    await this.prisma.pipeline.delete({ where: { id } });
    return { message: 'Pipeline deleted' };
  }
}
