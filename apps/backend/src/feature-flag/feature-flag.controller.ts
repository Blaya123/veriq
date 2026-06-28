import {
  Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards,
} from '@nestjs/common';
import { FeatureFlagService } from './feature-flag.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { SuperAdminGuard } from '../admin/guards/admin.guard';

@Controller('admin/feature-flags')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class FeatureFlagController {
  constructor(private featureFlagService: FeatureFlagService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('enabled') enabled?: string,
  ) {
    return this.featureFlagService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
      enabled: enabled !== undefined ? enabled === 'true' : undefined,
    });
  }

  @Get(':key')
  findByKey(@Param('key') key: string) {
    return this.featureFlagService.findByKey(key);
  }

  @Post()
  create(@Body() body: {
    name: string;
    key: string;
    description?: string;
    enabled?: boolean;
    workspaceTargeting?: string[];
  }) {
    return this.featureFlagService.create(body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: {
      name?: string;
      description?: string;
      enabled?: boolean;
      workspaceTargeting?: string[];
    },
  ) {
    return this.featureFlagService.update(id, body);
  }

  @Post(':id/toggle')
  toggle(@Param('id') id: string) {
    return this.featureFlagService.toggle(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.featureFlagService.delete(id);
  }
}
