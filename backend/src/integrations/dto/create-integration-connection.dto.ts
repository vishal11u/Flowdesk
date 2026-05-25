import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import {
  IntegrationChannel,
  IntegrationStatus,
} from '../domain/integration-channel';

export class CreateIntegrationConnectionDto {
  @IsEnum(IntegrationChannel)
  channel: IntegrationChannel;

  @IsEnum(IntegrationStatus)
  @IsOptional()
  status?: IntegrationStatus;

  @IsString()
  @IsOptional()
  externalAccountId?: string;

  @IsObject()
  @IsOptional()
  settings?: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  credentialsRef?: Record<string, unknown>;
}
