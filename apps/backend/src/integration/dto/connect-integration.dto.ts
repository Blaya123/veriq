import { IsString, IsObject, IsOptional } from 'class-validator';
import { IntegrationType } from '../../lib/prisma-enums';

export class ConnectIntegrationDto {
  type: IntegrationType;

  @IsString()
  name: string;

  @IsObject()
  @IsOptional()
  credentials?: Record<string, any>;
}
