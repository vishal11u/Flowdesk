import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  organizationId?: number;

  @Column({ nullable: true })
  userId?: number;

  @Column()
  method: string;

  @Column()
  path: string;

  @Column()
  statusCode: number;

  @Column({ nullable: true })
  ip?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;
}
