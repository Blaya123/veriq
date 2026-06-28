import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConversationStatus } from '../lib/prisma-enums';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Injectable()
export class ConversationService {
  constructor(private prisma: PrismaService) {}

  async create(workspaceId: string, dto: CreateConversationDto) {
    return this.prisma.conversation.create({
      data: { ...dto, workspaceId },
      include: { contact: true, messages: { take: 20, orderBy: { createdAt: 'desc' } } },
    });
  }

  async getById(id: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        contact: true,
        messages: { orderBy: { createdAt: 'asc' } },
        assignedTo: true,
        integration: true,
      },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');
    return conversation;
  }

  async getByWorkspace(
    workspaceId: string,
    query?: { status?: ConversationStatus; contactId?: string; assignedToId?: string },
  ) {
    const where: any = { workspaceId };
    if (query?.status) where.status = query.status;
    if (query?.contactId) where.contactId = query.contactId;
    if (query?.assignedToId) where.assignedToId = query.assignedToId;
    return this.prisma.conversation.findMany({
      where,
      include: {
        contact: true,
        assignedTo: true,
        integration: true,
        _count: { select: { messages: true } },
      },
      orderBy: { lastMessageAt: { sort: 'desc', nulls: 'last' } },
    });
  }

  async assignToUser(id: string, userId: string) {
    await this.getById(id);
    return this.prisma.conversation.update({
      where: { id },
      data: { assignedToId: userId },
      include: { contact: true, assignedTo: true },
    });
  }

  async updateStatus(id: string, status: ConversationStatus) {
    await this.getById(id);
    return this.prisma.conversation.update({
      where: { id },
      data: { status },
      include: { contact: true },
    });
  }

  async getMessages(id: string, query?: { limit?: number; offset?: number }) {
    await this.getById(id);
    const limit = query?.limit ?? 50;
    const offset = query?.offset ?? 0;
    return this.prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: { sender: true },
    });
  }
}
