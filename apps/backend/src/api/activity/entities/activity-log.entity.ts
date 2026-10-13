import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('activity_log')
export class ActivityLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'occurred_at', type: 'timestamptz' })
  occurredAt!: Date;

  @Column({ name: 'event', type: 'varchar', length: 64 })
  event!: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId!: string | null;

  @Column({ name: 'actor_email', type: 'varchar', length: 255, nullable: true })
  actorEmail!: string | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 255, nullable: true })
  ipAddress!: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent!: string | null;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata!: object | null;
}
