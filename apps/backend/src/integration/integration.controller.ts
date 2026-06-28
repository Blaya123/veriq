import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { IntegrationService } from './integration.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ConnectIntegrationDto } from './dto/connect-integration.dto';

@Controller('integrations')
export class IntegrationController {
  constructor(private integrationService: IntegrationService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  connect(
    @Body() dto: ConnectIntegrationDto,
    @CurrentUser('workspaceId') workspaceId: string,
  ) {
    return this.integrationService.connect(workspaceId, dto.type, dto.name, dto.credentials);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@CurrentUser('workspaceId') workspaceId: string) {
    return this.integrationService.findAllByWorkspace(workspaceId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getStatus(@Param('id') id: string) {
    return this.integrationService.getStatus(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  disconnect(@Param('id') id: string) {
    return this.integrationService.disconnect(id);
  }

  @Post(':id/reconnect')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  reconnect(@Param('id') id: string) {
    return this.integrationService.reconnect(id);
  }

  @Post(':id/sync')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  sync(@Param('id') id: string) {
    return this.integrationService.syncMessages(id);
  }

  @Post('webhook/:channel')
  @HttpCode(HttpStatus.OK)
  webhook(@Param('channel') channel: string, @Body() payload: any) {
    return this.integrationService.handleWebhook(channel, payload);
  }

  @Get('oauth/:type/callback')
  oauthCallback(
    @Param('type') type: string,
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
    return this.integrationService.handleOAuthCallback(type as any, code, state);
  }
}
