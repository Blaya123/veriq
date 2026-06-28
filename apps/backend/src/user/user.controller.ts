import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  getProfile(@CurrentUser('id') id: string) {
    return this.userService.findById(id);
  }

  @Patch('me')
  updateProfile(
    @CurrentUser('id') id: string,
    @Body() body: { name?: string; avatarUrl?: string },
  ) {
    return this.userService.updateProfile(id, body);
  }

  @Get(':id')
  getUserById(@Param('id') id: string) {
    return this.userService.findById(id);
  }
}
