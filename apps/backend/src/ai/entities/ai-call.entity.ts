import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AiCallStatus } from '../ai-call-status.enum';
import { AiProvider } from '../ai-provider.enum';
import { AiUsagePurpose } from '../ai-usage-purpose.enum';

@Entity('ai_call')
export class AiCallEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @Column({ type: 'date', name: 'day' })
  day!: string;

  @Column({ type: 'varchar', length: 20, name: 'provider' })
  provider!: AiProvider;

  @Column({ type: 'varchar', length: 60, name: 'model' })
  model!: string;

  @Column({ type: 'varchar', length: 12, name: 'purpose' })
  purpose!: AiUsagePurpose;

  @Column({ type: 'varchar', length: 10, name: 'status' })
  status!: AiCallStatus;

  @Column({ type: 'boolean', name: 'is_quota_hit', default: false })
  isQuotaHit!: boolean;

  @Column({ type: 'int', name: 'input_tokens', default: 0 })
  inputTokens!: number;

  @Column({ type: 'int', name: 'output_tokens', default: 0 })
  outputTokens!: number;

  @Column({ type: 'int', name: 'latency_ms', nullable: true })
  latencyMs!: number | null;

  @Column({ type: 'varchar', length: 300, name: 'error', nullable: true })
  error!: string | null;

  @Column({ type: 'varchar', length: 60, name: 'label', nullable: true })
  label!: string | null;

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId!: string | null;
}
