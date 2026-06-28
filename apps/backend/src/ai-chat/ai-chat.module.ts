import { Module } from '@nestjs/common';
import { AiChatController } from './ai-chat.controller';
import { AiChatService } from './ai-chat.service';
import { AiChatGateway } from './ai-chat.gateway';

@Module({
  controllers: [AiChatController],
  providers: [AiChatService, AiChatGateway],
  exports: [AiChatService],
})
export class AiChatModule {}
