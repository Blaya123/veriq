import { Module } from '@nestjs/common';
import { AiReplyController } from './ai-reply.controller';
import { AiReplyService } from './ai-reply.service';

@Module({
  controllers: [AiReplyController],
  providers: [AiReplyService],
  exports: [AiReplyService],
})
export class AiReplyModule {}
