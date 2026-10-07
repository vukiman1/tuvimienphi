import { Field, Float, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { AiCallStatus } from '../../../ai/ai-call-status.enum';
import { AiProvider } from '../../../ai/ai-provider';
import { AiSource } from '../../../ai/ai-settings.service';
import { AiUsagePurpose } from '../../../ai/ai-usage-purpose.enum';
import { AiHealthStatus } from '../../../ai/entities/ai-provider.entity';

registerEnumType(AiProvider, { name: 'AiProvider' });
registerEnumType(AiHealthStatus, { name: 'AiHealthStatus' });
registerEnumType(AiSource, { name: 'AiSource' });
registerEnumType(AiUsagePurpose, { name: 'AiUsagePurpose' });
registerEnumType(AiCallStatus, { name: 'AiCallStatus' });

@ObjectType()
export class AdminAiHealth {
  @Field(() => AiHealthStatus)
  status: AiHealthStatus;

  @Field()
  checkedAt: string;

  @Field(() => Int, { nullable: true })
  latencyMs: number | null;

  @Field(() => String, { nullable: true })
  model: string | null;

  @Field(() => String, { nullable: true })
  error: string | null;
}

@ObjectType()
export class AdminAiProvider {
  @Field(() => AiProvider)
  provider: AiProvider;

  @Field()
  hasApiKey: boolean;

  @Field(() => String, { nullable: true })
  apiKeyHint: string | null;

  @Field(() => [String])
  models: string[];

  @Field()
  isActive: boolean;

  @Field(() => AdminAiHealth, { nullable: true })
  health: AdminAiHealth | null;

  @Field(() => Float, { nullable: true })
  monthlyBudgetUsd: number | null;

  @Field(() => String, { nullable: true })
  updatedAt: string | null;
}

@ObjectType()
export class AdminAiUsageDay {
  @Field()
  day: string;

  @Field(() => AiProvider)
  provider: AiProvider;

  @Field()
  model: string;

  @Field(() => AiUsagePurpose)
  purpose: AiUsagePurpose;

  @Field(() => Int)
  calls: number;

  @Field(() => Int)
  failedCalls: number;

  @Field(() => Int)
  quotaHits: number;

  @Field(() => Float)
  inputTokens: number;

  @Field(() => Float)
  outputTokens: number;

  @Field(() => Float, { nullable: true })
  costUsd: number | null;
}

@ObjectType()
export class AdminAiSettings {
  @Field(() => AiSource)
  source: AiSource;

  @Field(() => [AdminAiProvider])
  providers: AdminAiProvider[];
}

@ObjectType()
export class AdminAiCall {
  @Field(() => ID)
  id: string;

  @Field()
  at: string;

  @Field(() => AiProvider)
  provider: AiProvider;

  @Field()
  model: string;

  @Field(() => AiUsagePurpose)
  purpose: AiUsagePurpose;

  @Field(() => AiCallStatus)
  status: AiCallStatus;

  @Field()
  isQuotaHit: boolean;

  @Field(() => Int)
  inputTokens: number;

  @Field(() => Int)
  outputTokens: number;

  @Field(() => Int, { nullable: true })
  latencyMs: number | null;

  @Field(() => Float, { nullable: true })
  costUsd: number | null;

  @Field(() => String, { nullable: true })
  error: string | null;

  @Field(() => String, { nullable: true })
  label: string | null;

  @Field(() => String, { nullable: true })
  userEmail: string | null;
}

@ObjectType()
export class AdminAiCallPage {
  @Field(() => [AdminAiCall])
  items: AdminAiCall[];

  @Field(() => Int)
  total: number;
}
