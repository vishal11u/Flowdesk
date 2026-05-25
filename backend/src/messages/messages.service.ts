import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entity/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { Client } from '../clients/entity/client.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
  ) {}

  async create(
    createMessageDto: CreateMessageDto,
    organizationId: number,
  ): Promise<Message> {
    const client = await this.clientsRepository.findOne({
      where: { id: createMessageDto.clientId, organizationId },
    });

    if (!client) {
      throw new NotFoundException(
        `Client with ID ${createMessageDto.clientId} not found`,
      );
    }

    const message = this.messagesRepository.create(createMessageDto);
    return this.messagesRepository.save(message);
  }

  async findByClientId(
    clientId: number,
    organizationId: number,
  ): Promise<Message[]> {
    const client = await this.clientsRepository.findOne({
      where: { id: clientId, organizationId },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    return this.messagesRepository.find({
      where: { clientId },
      order: { timestamp: 'ASC' },
    });
  }
}
