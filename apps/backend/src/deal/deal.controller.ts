import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DealService } from './deal.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';

@Controller('deals')
@UseGuards(JwtAuthGuard)
export class DealController {
  constructor(private dealService: DealService) {}

  @Post()
  create(
    @Body() dto: CreateDealDto,
    @CurrentUser('workspaceId') workspaceId: string,
  ) {
    return this.dealService.create(workspaceId, dto);
  }

  @Get()
  findAll(
    @CurrentUser('workspaceId') workspaceId: string,
    @Query('pipelineId') pipelineId?: string,
  ) {
    return this.dealService.findAll(workspaceId, pipelineId);
  }

  @Get('stats/:pipelineId')
  getStats(
    @CurrentUser('workspaceId') workspaceId: string,
    @Param('pipelineId') pipelineId: string,
  ) {
    return this.dealService.getPipelineStats(workspaceId, pipelineId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.dealService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDealDto) {
    return this.dealService.update(id, dto);
  }

  @Patch(':id/move')
  moveDeal(
    @Param('id') id: string,
    @Body() body: { stageId: string; order?: number },
  ) {
    return this.dealService.moveDeal(id, body.stageId, body.order);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.dealService.delete(id);
  }
}
