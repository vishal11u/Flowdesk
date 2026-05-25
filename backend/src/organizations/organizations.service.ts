import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entity/organization.entity';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private organizationsRepository: Repository<Organization>,
  ) {}

  async create(name: string): Promise<Organization> {
    const organization = this.organizationsRepository.create({
      name,
      slug: this.slugify(name),
    });

    return this.organizationsRepository.save(organization);
  }

  private slugify(name: string): string {
    const suffix = Math.random().toString(36).slice(2, 8);
    const base =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'workspace';

    return `${base}-${suffix}`;
  }
}
