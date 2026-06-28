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
import { PipelineService } from './pipeline.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreatePipelineDto, UpdatePipelineDto } from './dto/create-pipeline.dto';

@Controller('pipelines')
@UseGuards(JwtAuthGuard)
export class PipelineController {
  constructor(private pipelineService: PipelineService) {}

  @Post()
  create(
    @Body() dto: CreatePipelineDto,
    @CurrentUser('workspaceId') workspaceId: string,
  ) {
    return this.pipelineService.create(workspaceId, dto);
  }

  @Get()
  findAll(@CurrentUser('workspaceId') workspaceId: string) {
    return this.pipelineService.findAll(workspaceId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.pipelineService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePipelineDto) {
    return this.pipelineService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.pipelineService.delete(id);
  }
}
