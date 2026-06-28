import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AiChatService } from './ai-chat.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('ai-chat')
@UseGuards(JwtAuthGuard)
export class AiChatController {
  constructor(private aiChatService: AiChatService) {}

  @Post()
  createChat(
    @Body() dto: CreateChatDto,
    @CurrentUser('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.aiChatService.createChat(workspaceId, userId, dto);
  }

  @Get()
  getChats(
    @CurrentUser('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.aiChatService.getChats(workspaceId, userId);
  }

  @Get(':id')
  getChat(
    @Param('id') id: string,
    @CurrentUser('workspaceId') workspaceId: string,
  ) {
    return this.aiChatService.getChatById(id, workspaceId);
  }

  @Delete(':id')
  deleteChat(
    @Param('id') id: string,
    @CurrentUser('workspaceId') workspaceId: string,
  ) {
    return this.aiChatService.deleteChat(id, workspaceId);
  }

  @Post(':id/messages')
  sendMessage(
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
    @CurrentUser('workspaceId') workspaceId: string,
  ) {
    return this.aiChatService.sendMessage(id, workspaceId, dto);
  }

  @Get(':id/messages')
  getHistory(
    @Param('id') id: string,
    @CurrentUser('workspaceId') workspaceId: string,
  ) {
    return this.aiChatService.getHistory(id, workspaceId);
  }

  @Post(':id/stream')
  async streamMessage(
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
    @CurrentUser('workspaceId') workspaceId: string,
    @Res() res: Response,
  ) {
    const chat = await this.aiChatService.getChatById(id, workspaceId);
    await this.aiChatService.saveUserMessage(id, dto.content);

    const history = await this.aiChatService.getHistory(id, workspaceId);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    let fullContent = '';

    try {
      const generator = this.aiChatService.streamAiProvider(
        history,
        chat.systemPrompt || undefined,
        dto.model,
      );

      for await (const chunk of generator) {
        fullContent += chunk;
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      }

      await this.aiChatService.saveAssistantMessage(id, fullContent);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch {
      res.write(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`);
      res.end();
    }
  }
}
