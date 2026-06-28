import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { DealStatus } from '../../lib/prisma-enums';

export class CreateDealDto {
  @IsString()
  name: string;

  @IsNumber()
  @IsOptional()
  value?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  pipelineId: string;

  @IsString()
  stageId: string;

  @IsString()
  @IsOptional()
  contactId?: string;

  @IsString()
  @IsOptional()
  assignedToId?: string;

  @IsDateString()
  @IsOptional()
  expectedCloseDate?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  probability?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsOptional()
  status?: DealStatus;
}
