import { Field, Float, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { AiProvider } from '../../../ai/ai-provider';
import { AiSource } from '../../../ai/ai-settings.service';
import { AiUsagePurpose } from '../../../ai/ai-usage-purpose.enum';
import { AiHealthStatus } from '../../../ai/entities/ai-provider.entity';

registerEnumType(AiProvider, { name: 'AiProvider' });
registerEnumType(AiHealthStatus, { name: 'AiHealthStatus' });
registerEnumType(AiSource, { name: 'AiSource' });
registerEnumType(AiUsagePurpose, { name: 'AiUsagePurpose' });

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
