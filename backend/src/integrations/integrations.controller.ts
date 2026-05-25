import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/domain/authenticated-user';
import { CreateIntegrationConnectionDto } from './dto/create-integration-connection.dto';
import { IngestIntegrationEventDto } from './dto/ingest-integration-event.dto';
import { SendIntegrationMessageDto } from './dto/send-integration-message.dto';
import { IntegrationsService } from './integrations.service';

@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post('connections')
  async createConnection(
    @Body() dto: CreateIntegrationConnectionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.integrationsService.createConnection(dto, user.organizationId);
  }

  @Get('connections')
  async listConnections(@CurrentUser() user: AuthenticatedUser) {
    return this.integrationsService.listConnections(user.organizationId);
  }

  @Post('send')
  async sendMessage(
    @Body() dto: SendIntegrationMessageDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.integrationsService.sendMessage(dto, user.organizationId);
  }

  @Post('ingest')
  async ingestEvent(
    @Body() dto: IngestIntegrationEventDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.integrationsService.ingestEvent(dto, user.organizationId);
  }
}
