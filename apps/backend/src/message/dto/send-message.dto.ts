import { IsString, IsOptional, IsObject } from 'class-validator';
import { MessageContentType, MessageDirection } from '../../lib/prisma-enums';

export class SendMessageDto {
  @IsString()
  conversationId: string;

  @IsString()
  content: string;

  @IsOptional()
  contentType?: MessageContentType;

  @IsOptional()
  direction?: MessageDirection;

  @IsString()
  @IsOptional()
  senderId?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
