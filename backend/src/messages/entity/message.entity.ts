import {
  ManyToOne,
  JoinColumn,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Client } from '../../clients/entity/client.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  clientId: number;

  @ManyToOne(() => Client, (client) => client.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column('text')
  message: string;

  @Column()
  type: 'incoming' | 'outgoing';

  @CreateDateColumn()
  timestamp: Date;
}
