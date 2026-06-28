import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AiChatService } from './ai-chat.service';

@WebSocketGateway({ namespace: '/ai-chat', cors: { origin: '*', credentials: true } })
export class AiChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private aiChatService: AiChatService) {}

  handleConnection(client: Socket) {
    const workspaceId = client.handshake.query.workspaceId as string;
    if (workspaceId) {
      client.join(`workspace:${workspaceId}`);
    }
  }

  handleDisconnect(client: Socket) {
    for (const room of client.rooms) {
      if (room !== client.id) client.leave(room);
    }
  }

  @SubscribeMessage('joinChat')
  handleJoinChat(client: Socket, chatId: string) {
    client.join(`chat:${chatId}`);
    return { event: 'joined', data: chatId };
  }

  @SubscribeMessage('leaveChat')
  handleLeaveChat(client: Socket, chatId: string) {
    client.leave(`chat:${chatId}`);
    return { event: 'left', data: chatId };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    client: Socket,
    payload: { chatId: string; content: string; model?: string; workspaceId: string },
  ) {
    const { chatId, content, model, workspaceId } = payload;

    const userMessage = await this.aiChatService.saveUserMessage(chatId, content);
    this.server.to(`chat:${chatId}`).emit('message', userMessage);

    const history = await this.aiChatService.getHistory(chatId, workspaceId);
    const chat = await this.aiChatService.getChatById(chatId, workspaceId);

    try {
      const generator = this.aiChatService.streamAiProvider(
        history,
        chat.systemPrompt || undefined,
        model,
      );

      let fullContent = '';
      for await (const chunk of generator) {
        fullContent += chunk;
        this.server
          .to(`chat:${chatId}`)
          .emit('streamChunk', { chatId, content: chunk });
      }

      const assistantMessage = await this.aiChatService.saveAssistantMessage(chatId, fullContent);
      this.server.to(`chat:${chatId}`).emit('messageDone', { chatId, message: assistantMessage });
    } catch {
      this.server
        .to(`chat:${chatId}`)
        .emit('streamError', { chatId, error: 'Stream failed' });
    }
  }
}
