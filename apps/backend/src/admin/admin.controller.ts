import {
  Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuditService } from '../audit/audit.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { SuperAdminGuard } from './guards/admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class AdminController {
  constructor(
    private adminService: AdminService,
    private audit: AuditService,
  ) {}

  @Get('dashboard')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  listUsers(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.adminService.listUsers({
      search,
      role,
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      sortBy,
      sortOrder,
    });
  }

  @Get('users/:id')
  getUserDetail(@Param('id') id: string) {
    return this.adminService.getUserDetail(id);
  }

  @Patch('users/:id')
  updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.updateUser(id, dto, adminId);
  }

  @Get('workspaces')
  listWorkspaces(
    @Query('search') search?: string,
    @Query('plan') plan?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.adminService.listWorkspaces({
      search,
      plan,
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      sortBy,
      sortOrder,
    });
  }

  @Get('workspaces/:id')
  getWorkspaceDetail(@Param('id') id: string) {
    return this.adminService.getWorkspaceDetail(id);
  }

  @Patch('workspaces/:id')
  updateWorkspace(
    @Param('id') id: string,
    @Body() body: { name?: string; plan?: string },
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.updateWorkspace(id, body, adminId);
  }

  @Delete('workspaces/:id')
  deleteWorkspace(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.deleteWorkspace(id, adminId);
  }

  @Post('users/:id/super-admin')
  setSuperAdmin(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.setSuperAdmin(id, adminId);
  }

  @Delete('users/:id/super-admin')
  removeSuperAdmin(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.removeSuperAdmin(id, adminId);
  }

  @Get('health')
  getSystemHealth() {
    return this.adminService.getSystemHealth();
  }

  @Get('audit-logs')
  getAuditLogs(
    @Query('userId') userId?: string,
    @Query('workspaceId') workspaceId?: string,
    @Query('action') action?: string,
    @Query('entity') entity?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.audit.query({
      userId,
      workspaceId,
      action,
      entity,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      sortBy,
      sortOrder,
    });
  }

  @Get('audit-logs/actions')
  getAuditActions() {
    return this.audit.getDistinctActions();
  }
}
