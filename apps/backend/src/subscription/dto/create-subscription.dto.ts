import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum BillingInterval {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export class CreateSubscriptionDto {
  @IsString()
  planCode: string;

  @IsOptional()
  @IsEnum(BillingInterval)
  billingInterval?: BillingInterval;

  @IsOptional()
  @IsString()
  paymentMethodId?: string;
}

export class UpdateSubscriptionDto {
  @IsString()
  planCode: string;

  @IsOptional()
  @IsEnum(BillingInterval)
  billingInterval?: BillingInterval;
}
