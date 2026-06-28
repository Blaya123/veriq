import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { InvoiceStatus } from '../../lib/prisma-enums';

export class CreateInvoiceDto {
  @IsString()
  workspaceId: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  contactId?: string;
}

export class UpdateInvoiceStatusDto {
  status: InvoiceStatus;
}

export class ProcessPaymentDto {
  @IsString()
  provider: string;

  @IsString()
  providerPaymentId: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;
}
