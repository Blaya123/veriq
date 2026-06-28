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
import { ContactService } from './contact.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { ContactSource } from '../lib/prisma-enums';

@Controller('contacts')
@UseGuards(JwtAuthGuard)
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Post()
  create(
    @Body() dto: CreateContactDto,
    @CurrentUser('workspaceId') workspaceId: string,
  ) {
    return this.contactService.create(workspaceId, dto);
  }

  @Get()
  findAll(
    @CurrentUser('workspaceId') workspaceId: string,
    @Query('search') search?: string,
    @Query('source') source?: ContactSource,
  ) {
    return this.contactService.findAll(workspaceId, { search, source });
  }

  @Get('search')
  search(
    @CurrentUser('workspaceId') workspaceId: string,
    @Query('q') query: string,
  ) {
    return this.contactService.search(workspaceId, query);
  }

  @Get('source/:source')
  getBySource(
    @CurrentUser('workspaceId') workspaceId: string,
    @Param('source') source: ContactSource,
  ) {
    return this.contactService.getBySource(workspaceId, source);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.contactService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateContactDto) {
    return this.contactService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.contactService.delete(id);
  }

  @Post('merge-duplicates')
  mergeDuplicates(@CurrentUser('workspaceId') workspaceId: string) {
    return this.contactService.mergeDuplicates(workspaceId);
  }
}
