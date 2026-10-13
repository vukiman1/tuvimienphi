import { Column, Entity, PrimaryColumn } from 'typeorm';
import { AiProvider } from '../ai-provider.enum';
import { AiUsagePurpose } from '../ai-usage-purpose.enum';

@Entity('ai_usage_daily')
export class AiUsageDailyEntity {
  @PrimaryColumn({ type: 'date', name: 'day' })
  day!: string;

  @PrimaryColumn({ type: 'varchar', length: 20, name: 'provider' })
  provider!: AiProvider;

  @PrimaryColumn({ type: 'varchar', length: 60, name: 'model' })
  model!: string;

  @PrimaryColumn({ type: 'varchar', length: 12, name: 'purpose' })
  purpose!: AiUsagePurpose;

  @Column({ type: 'int', name: 'calls', default: 0 })
  calls!: number;

  @Column({ type: 'int', name: 'failed_calls', default: 0 })
  failedCalls!: number;

  @Column({ type: 'int', name: 'quota_hits', default: 0 })
  quotaHits!: number;

  @Column({ type: 'bigint', name: 'input_tokens', default: 0 })
  inputTokens!: string;

  @Column({ type: 'bigint', name: 'output_tokens', default: 0 })
  outputTokens!: string;
}
