import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@Controller('admin')
export class AdminSetupController {
  constructor(private adminService: AdminService) {}

  @Post('setup')
  @UseGuards(JwtAuthGuard)
  async initialSetup(@Body('email') email: string) {
    return this.adminService.makeInitialSuperAdmin(email);
  }
}
