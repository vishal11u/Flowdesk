import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientsService } from '../clients/clients.service';
import { MessagesService } from '../messages/messages.service';
import { CreateIntegrationConnectionDto } from './dto/create-integration-connection.dto';
import { IngestIntegrationEventDto } from './dto/ingest-integration-event.dto';
import { SendIntegrationMessageDto } from './dto/send-integration-message.dto';
import { IntegrationStatus } from './domain/integration-channel';
import { IntegrationConnection } from './entity/integration-connection.entity';

@Injectable()
export class IntegrationsService {
  constructor(
    @InjectRepository(IntegrationConnection)
    private readonly integrationsRepository: Repository<IntegrationConnection>,
    private readonly clientsService: ClientsService,
    private readonly messagesService: MessagesService,
  ) {}

  async createConnection(
    dto: CreateIntegrationConnectionDto,
    organizationId: number,
  ): Promise<IntegrationConnection> {
    const connection = this.integrationsRepository.create({
      ...dto,
      organizationId,
      status: dto.status ?? IntegrationStatus.NeedsAuth,
    });

    return this.integrationsRepository.save(connection);
  }

  async listConnections(
    organizationId: number,
  ): Promise<IntegrationConnection[]> {
    return this.integrationsRepository.find({ where: { organizationId } });
  }

  async sendMessage(dto: SendIntegrationMessageDto, organizationId: number) {
    const connection = await this.integrationsRepository.findOne({
      where: { organizationId, channel: dto.channel },
    });

    if (!connection) {
      throw new NotFoundException(
        `${dto.channel} integration is not connected`,
      );
    }

    return {
      channel: dto.channel,
      status:
        connection.status === IntegrationStatus.Connected
          ? 'queued'
          : 'needs_auth',
      recipient: dto.recipient,
      message: dto.message,
      providerMessageId: null,
    };
  }

  async ingestEvent(dto: IngestIntegrationEventDto, organizationId: number) {
    const client = await this.clientsService.findOrCreateByEmail(
      {
        name: dto.senderName,
        email: dto.senderEmail,
        niche: dto.niche,
        source: dto.channel,
        metadata: dto.metadata,
      },
      organizationId,
    );

    const message = await this.messagesService.create(
      {
        clientId: client.id,
        message: dto.message,
        type: 'incoming',
      },
      organizationId,
    );

    return {
      client,
      message,
      normalizedEvent: {
        channel: dto.channel,
        senderEmail: dto.senderEmail,
      },
    };
  }
}
