import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  BusinessNiche,
  ClientStatus,
} from '../../common/domain/business-niche';

export class CreateClientDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsEnum(BusinessNiche)
  @IsOptional()
  niche?: BusinessNiche;

  @IsEnum(ClientStatus)
  @IsOptional()
  status?: ClientStatus;

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  pipelineStage?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
