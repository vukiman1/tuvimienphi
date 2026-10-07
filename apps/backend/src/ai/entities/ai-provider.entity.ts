import { Exclude } from 'class-transformer';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { AiProvider } from '../ai-provider.enum';

export enum AiHealthStatus {
  OK = 'OK',
  FAILED = 'FAILED',
}

@Entity('ai_provider')
export class AiProviderEntity {
  @PrimaryColumn({ type: 'varchar', length: 20, name: 'provider' })
  provider!: AiProvider;

  @Exclude()
  @Column({ type: 'text', name: 'api_key', nullable: true })
  apiKey!: string | null;

  @Column({ type: 'varchar', length: 16, name: 'api_key_hint', nullable: true })
  apiKeyHint!: string | null;

  @Column({ type: 'jsonb', name: 'models', default: () => "'[]'" })
  models!: string[];

  @Column({ type: 'boolean', name: 'is_active', default: false })
  isActive!: boolean;

  @Column({ type: 'varchar', length: 10, name: 'health_status', nullable: true })
  healthStatus!: AiHealthStatus | null;

  @Column({ type: 'timestamptz', name: 'health_checked_at', nullable: true })
  healthCheckedAt!: Date | null;

  @Column({ type: 'int', name: 'health_latency_ms', nullable: true })
  healthLatencyMs!: number | null;

  @Column({ type: 'varchar', length: 60, name: 'health_model', nullable: true })
  healthModel!: string | null;

  @Column({ type: 'text', name: 'health_error', nullable: true })
  healthError!: string | null;

  @Column({ type: 'timestamptz', name: 'updated_at', nullable: true })
  updatedAt!: Date | null;
}
