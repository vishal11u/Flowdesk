import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  BusinessNiche,
  ClientStatus,
} from '../../common/domain/business-niche';
import { Message } from '../../messages/entity/message.entity';
import { Organization } from '../../organizations/entity/organization.entity';

@Index(['organizationId', 'email'], { unique: true })
@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  organizationId: number;

  @ManyToOne(() => Organization, (organization) => organization.clients, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  company?: string;

  @Column({
    type: 'varchar',
    default: BusinessNiche.B2BSaasSupport,
  })
  niche: BusinessNiche;

  @Column({
    type: 'varchar',
    default: ClientStatus.Lead,
  })
  status: ClientStatus;

  @Column({ nullable: true })
  source?: string;

  @Column({ nullable: true })
  pipelineStage?: string;

  @Column('text', { nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @OneToMany(() => Message, (message) => message.client)
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;
}
