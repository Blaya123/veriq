import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/conversations', cors: { origin: '*', credentials: true } })
export class ConversationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

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

  emitConversationUpdated(conversationId: string, data: any) {
    this.server.to(`conversation:${conversationId}`).emit('conversation:updated', data);
  }

  emitNewMessage(conversationId: string, message: any) {
    this.server.to(`conversation:${conversationId}`).emit('message:new', message);
  }

  emitWorkspaceUpdate(workspaceId: string, event: string, data: any) {
    this.server.to(`workspace:${workspaceId}`).emit(event, data);
  }
}
