import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../lib/prisma-enums';

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
  constructor(private workspaceService: WorkspaceService) {}

  @Post()
  create(
    @Body() body: { name: string; slug: string; logoUrl?: string },
    @CurrentUser('id') userId: string,
  ) {
    return this.workspaceService.create(body, userId);
  }

  @Get(':idOrSlug')
  get(@Param('idOrSlug') idOrSlug: string) {
    const isCuid = idOrSlug.length === 25;
    if (isCuid) {
      return this.workspaceService.getById(idOrSlug);
    }
    return this.workspaceService.getBySlug(idOrSlug);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: { name?: string; logoUrl?: string; plan?: any },
  ) {
    return this.workspaceService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.workspaceService.delete(id, userId);
  }

  @Post(':id/members')
  inviteMember(
    @Param('id') id: string,
    @Body() body: { email: string; role?: UserRole },
  ) {
    return this.workspaceService.inviteMember(id, body.email, body.role);
  }

  @Delete(':id/members/:userId')
  removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.workspaceService.removeMember(id, userId);
  }

  @Patch(':id/members/:userId')
  changeRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body('role') role: UserRole,
  ) {
    return this.workspaceService.changeRole(id, userId, role);
  }
}
