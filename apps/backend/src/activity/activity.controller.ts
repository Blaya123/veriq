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
import { ActivityService } from './activity.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ActivityType } from '../lib/prisma-enums';

class CreateActivityDto {
  type: 'NOTE' | 'CALL' | 'EMAIL' | 'MEETING' | 'TASK';
  subject: string;
  description?: string;
  contactId?: string;
  dealId?: string;
}

@Controller('activities')
@UseGuards(JwtAuthGuard)
export class ActivityController {
  constructor(private activityService: ActivityService) {}

  @Post()
  create(
    @Body() dto: CreateActivityDto,
    @CurrentUser('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.activityService.create({
      ...dto,
      workspaceId,
      createdById: userId,
    });
  }

  @Get()
  findAll(
    @CurrentUser('workspaceId') workspaceId: string,
    @Query('limit') limit?: string,
  ) {
    return this.activityService.findByWorkspace(
      workspaceId,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get('contact/:contactId')
  findByContact(@Param('contactId') contactId: string) {
    return this.activityService.findByContact(contactId);
  }

  @Get('deal/:dealId')
  findByDeal(@Param('dealId') dealId: string) {
    return this.activityService.findByDeal(dealId);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.activityService.delete(id);
  }
}
