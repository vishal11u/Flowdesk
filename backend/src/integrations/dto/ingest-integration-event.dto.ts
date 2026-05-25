import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { BusinessNiche } from '../../common/domain/business-niche';
import { IntegrationChannel } from '../domain/integration-channel';

export class IngestIntegrationEventDto {
  @IsEnum(IntegrationChannel)
  channel: IntegrationChannel;

  @IsString()
  @IsNotEmpty()
  senderName: string;

  @IsEmail()
  senderEmail: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsEnum(BusinessNiche)
  @IsOptional()
  niche?: BusinessNiche;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
