import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Post()
  send(@Body() dto: SendMessageDto) {
    return this.messageService.send(dto);
  }

  @Get('conversation/:conversationId')
  getByConversation(
    @Param('conversationId') conversationId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.messageService.getByConversation(conversationId, {
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Post('mark-read')
  markAsRead(@Body('messageIds') messageIds: string[]) {
    return this.messageService.markAsRead(messageIds);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.messageService.delete(id);
  }
}
