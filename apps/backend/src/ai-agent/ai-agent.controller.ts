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
import { AiAgentService } from './ai-agent.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateAgentDto } from './dto/create-agent.dto';

@Controller('ai-agents')
@UseGuards(JwtAuthGuard)
export class AiAgentController {
  constructor(private aiAgentService: AiAgentService) {}

  @Post()
  create(
    @Body() dto: CreateAgentDto,
    @CurrentUser('workspaceId') workspaceId: string,
  ) {
    return this.aiAgentService.create(workspaceId, dto);
  }

  @Get()
  findAll(@CurrentUser('workspaceId') workspaceId: string) {
    return this.aiAgentService.findAll(workspaceId);
  }

  @Get(':id')
  findById(
    @Param('id') id: string,
    @CurrentUser('workspaceId') workspaceId: string,
  ) {
    return this.aiAgentService.findById(id, workspaceId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateAgentDto>,
    @CurrentUser('workspaceId') workspaceId: string,
  ) {
    return this.aiAgentService.update(id, workspaceId, dto);
  }

  @Delete(':id')
  delete(
    @Param('id') id: string,
    @CurrentUser('workspaceId') workspaceId: string,
  ) {
    return this.aiAgentService.delete(id, workspaceId);
  }

  @Post(':id/execute')
  execute(
    @Param('id') id: string,
    @Body('input') input: string,
    @CurrentUser('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.aiAgentService.execute(id, workspaceId, input, userId);
  }

  @Get(':id/executions')
  getExecutions(
    @Param('id') id: string,
    @CurrentUser('workspaceId') workspaceId: string,
  ) {
    return this.aiAgentService.getExecutions(id, workspaceId);
  }
}
