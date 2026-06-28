import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from './message.service';
import { SendMessageDto } from './dto/send-message.dto';

@WebSocketGateway({ namespace: '/messages', cors: { origin: '*', credentials: true } })
export class MessageGateway {
  @WebSocketServer()
  server: Server;

  constructor(private messageService: MessageService) {}

  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, dto: SendMessageDto) {
    const message = await this.messageService.send(dto);
    return { event: 'message:sent', data: message };
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(client: Socket, messageIds: string[]) {
    const result = await this.messageService.markAsRead(messageIds);
    return { event: 'messages:read', data: result };
  }

  @SubscribeMessage('joinConversation')
  handleJoinConversation(client: Socket, conversationId: string) {
    client.join(`conversation:${conversationId}`);
    return { event: 'joined', data: conversationId };
  }

  @SubscribeMessage('leaveConversation')
  handleLeaveConversation(client: Socket, conversationId: string) {
    client.leave(`conversation:${conversationId}`);
    return { event: 'left', data: conversationId };
  }
}
