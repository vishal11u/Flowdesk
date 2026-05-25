import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  IntegrationChannel,
  IntegrationStatus,
} from '../domain/integration-channel';

@Index(['organizationId', 'channel'])
@Entity('integration_connections')
export class IntegrationConnection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  organizationId: number;

  @Column({ type: 'varchar' })
  channel: IntegrationChannel;

  @Column({ type: 'varchar' })
  status: IntegrationStatus;

  @Column({ nullable: true })
  externalAccountId?: string;

  @Column({ type: 'jsonb', nullable: true })
  settings?: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  credentialsRef?: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
