import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { BusinessNiche } from '../../common/domain/business-niche';

export class GenerateReplyDto {
  @IsNotEmpty()
  message: string;

  @IsEnum(BusinessNiche)
  @IsOptional()
  niche?: BusinessNiche;

  @IsObject()
  @IsOptional()
  clientContext?: Record<string, unknown>;

  @IsArray()
  @IsOptional()
  history?: Array<{
    role: 'client' | 'agent' | 'system';
    message: string;
  }>;

  @IsString()
  @IsOptional()
  businessRules?: string;
}
