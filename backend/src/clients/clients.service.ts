import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entity/client.entity';
import { CreateClientDto } from './dto/create-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
  ) {}

  async create(
    createClientDto: CreateClientDto,
    organizationId: number,
  ): Promise<Client> {
    const client = this.clientsRepository.create({
      ...createClientDto,
      organizationId,
    });

    try {
      return await this.clientsRepository.save(client);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException(
          'A client with this email already exists in this workspace',
        );
      }
      throw error;
    }
  }

  async findAll(organizationId: number): Promise<Client[]> {
    return this.clientsRepository.find({ where: { organizationId } });
  }

  async findOne(id: number, organizationId: number): Promise<Client> {
    const client = await this.clientsRepository.findOne({
      where: { id, organizationId },
    });
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    return client;
  }

  async findByEmail(
    email: string,
    organizationId: number,
  ): Promise<Client | undefined> {
    const client = await this.clientsRepository.findOne({
      where: { email, organizationId },
    });

    return client ?? undefined;
  }

  async findOrCreateByEmail(
    createClientDto: CreateClientDto,
    organizationId: number,
  ): Promise<Client> {
    const existingClient = await this.findByEmail(
      createClientDto.email,
      organizationId,
    );

    if (existingClient) {
      return existingClient;
    }

    return this.create(createClientDto, organizationId);
  }

  private isUniqueViolation(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    );
  }
}
