import { IsString, IsEmail, IsOptional, IsObject } from 'class-validator';
import { ContactSource } from '../../lib/prisma-enums';

export class CreateContactDto {
  @IsString()
  name: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsOptional()
  source?: ContactSource;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
