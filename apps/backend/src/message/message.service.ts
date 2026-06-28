import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConversationGateway } from '../conversation/conversation.gateway';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessageService {
  constructor(
    private prisma: PrismaService,
    private conversationGateway: ConversationGateway,
  ) {}

  async send(dto: SendMessageDto) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: dto.conversationId },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');

    const message = await this.prisma.message.create({
      data: {
        conversationId: dto.conversationId,
        content: dto.content,
        contentType: dto.contentType ?? 'TEXT',
        direction: dto.direction ?? 'OUTBOUND',
        senderId: dto.senderId,
        metadata: dto.metadata ? JSON.stringify(dto.metadata) : undefined,
      },
      include: { sender: true },
    });

    await this.prisma.conversation.update({
      where: { id: dto.conversationId },
      data: { lastMessageAt: new Date() },
    });

    this.conversationGateway.emitNewMessage(dto.conversationId, message);
    this.conversationGateway.emitConversationUpdated(dto.conversationId, {
      id: dto.conversationId,
      lastMessageAt: new Date(),
    });

    return message;
  }

  async getByConversation(
    conversationId: string,
    query?: { limit?: number; offset?: number },
  ) {
    const limit = query?.limit ?? 50;
    const offset = query?.offset ?? 0;
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: { sender: true },
    });
  }

  async markAsRead(messageIds: string[]) {
    await this.prisma.message.updateMany({
      where: { id: { in: messageIds } },
      data: { metadata: JSON.stringify({ readAt: new Date().toISOString() }) },
    });
    return { message: 'Messages marked as read', count: messageIds.length };
  }

  async delete(id: string) {
    const message = await this.prisma.message.findUnique({ where: { id } });
    if (!message) throw new NotFoundException('Message not found');
    await this.prisma.message.delete({ where: { id } });
    return { message: 'Message deleted' };
  }
}
