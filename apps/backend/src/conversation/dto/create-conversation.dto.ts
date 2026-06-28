import { IsString, IsOptional } from 'class-validator';
import { IntegrationType, ConversationStatus } from '../../lib/prisma-enums';

export class CreateConversationDto {
  @IsString()
  contactId: string;

  channel: IntegrationType;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsOptional()
  status?: ConversationStatus;

  @IsString()
  @IsOptional()
  integrationId?: string;

  @IsString()
  @IsOptional()
  assignedToId?: string;
}
