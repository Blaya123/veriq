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
import { KnowledgeBaseService } from './knowledge-base.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateArticleDto, UpdateArticleDto } from './dto/create-article.dto';

@Controller('knowledge-base')
@UseGuards(JwtAuthGuard)
export class KnowledgeBaseController {
  constructor(private knowledgeBaseService: KnowledgeBaseService) {}

  @Post()
  create(
    @Body() dto: CreateArticleDto,
    @CurrentUser('workspaceId') workspaceId: string,
  ) {
    return this.knowledgeBaseService.create(workspaceId, dto);
  }

  @Get()
  findAll(
    @CurrentUser('workspaceId') workspaceId: string,
    @Query('search') search?: string,
  ) {
    return this.knowledgeBaseService.findAll(workspaceId, search);
  }

  @Get('tags')
  getTags(@CurrentUser('workspaceId') workspaceId: string) {
    return this.knowledgeBaseService.getTags(workspaceId);
  }

  @Get('search')
  search(
    @CurrentUser('workspaceId') workspaceId: string,
    @Query('q') query: string,
  ) {
    return this.knowledgeBaseService.search(workspaceId, query);
  }

  @Get('rag')
  rag(
    @CurrentUser('workspaceId') workspaceId: string,
    @Query('q') query: string,
    @Query('limit') limit?: string,
  ) {
    return this.knowledgeBaseService.queryForRag(
      workspaceId,
      query,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Get(':id')
  findById(
    @Param('id') id: string,
    @CurrentUser('workspaceId') workspaceId: string,
  ) {
    return this.knowledgeBaseService.findById(id, workspaceId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateArticleDto,
    @CurrentUser('workspaceId') workspaceId: string,
  ) {
    return this.knowledgeBaseService.update(id, workspaceId, dto);
  }

  @Delete(':id')
  delete(
    @Param('id') id: string,
    @CurrentUser('workspaceId') workspaceId: string,
  ) {
    return this.knowledgeBaseService.delete(id, workspaceId);
  }
}
