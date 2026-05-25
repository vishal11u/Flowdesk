import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { IntegrationChannel } from '../domain/integration-channel';

export class SendIntegrationMessageDto {
  @IsEnum(IntegrationChannel)
  channel: IntegrationChannel;

  @IsString()
  @IsNotEmpty()
  recipient: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsObject()
  @IsOptional()
  context?: Record<string, unknown>;
}
