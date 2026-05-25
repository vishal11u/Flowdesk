import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entity/audit-log.entity';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogsRepository: Repository<AuditLog>,
  ) {}

  async record(event: Partial<AuditLog>): Promise<void> {
    const auditLog = this.auditLogsRepository.create(event);
    await this.auditLogsRepository.save(auditLog);
  }
}
