import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { ConversationStatus } from '../lib/prisma-enums';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationController {
  constructor(private conversationService: ConversationService) {}

  @Post()
  create(
    @Body() dto: CreateConversationDto,
    @CurrentUser('workspaceId') workspaceId: string,
  ) {
    return this.conversationService.create(workspaceId, dto);
  }

  @Get()
  findAll(
    @CurrentUser('workspaceId') workspaceId: string,
    @Query('status') status?: ConversationStatus,
    @Query('contactId') contactId?: string,
    @Query('assignedToId') assignedToId?: string,
  ) {
    return this.conversationService.getByWorkspace(workspaceId, { status, contactId, assignedToId });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.conversationService.getById(id);
  }

  @Get(':id/messages')
  getMessages(
    @Param('id') id: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.conversationService.getMessages(id, {
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Patch(':id/assign')
  assign(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ) {
    return this.conversationService.assignToUser(id, userId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: ConversationStatus,
  ) {
    return this.conversationService.updateStatus(id, status);
  }
}
