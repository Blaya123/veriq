import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiReplyService } from './ai-reply.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@Controller('ai-reply')
@UseGuards(JwtAuthGuard)
export class AiReplyController {
  constructor(private aiReplyService: AiReplyService) {}

  @Post('generate')
  generate(
    @Body('conversationId') conversationId: string,
    @Body('tone') tone?: 'professional' | 'friendly' | 'formal',
    @Body('context') context?: string,
  ) {
    return this.aiReplyService.generateReply(conversationId, { tone, context });
  }

  @Post('sentiment')
  analyzeSentiment(@Body('text') text: string) {
    return this.aiReplyService.analyzeSentiment(text);
  }

  @Post('suggest-action')
  suggestAction(@Body('conversationId') conversationId: string) {
    return this.aiReplyService.suggestNextAction(conversationId);
  }

  @Post('auto-respond')
  autoRespond(@Body('conversationId') conversationId: string) {
    return this.aiReplyService.autoRespond(conversationId);
  }
}
