import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class StageDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsNumber()
  @IsOptional()
  order?: number;
}

export class CreatePipelineDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StageDto)
  stages: StageDto[];

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class UpdatePipelineDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StageDto)
  @IsOptional()
  stages?: StageDto[];

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
