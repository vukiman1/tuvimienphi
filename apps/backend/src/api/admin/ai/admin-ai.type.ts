import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { AiProvider } from '../../../ai/ai-provider';
import { AiSource } from '../../../ai/ai-settings.service';
import { AiHealthStatus } from '../../../ai/entities/ai-provider.entity';

registerEnumType(AiProvider, { name: 'AiProvider' });
registerEnumType(AiHealthStatus, { name: 'AiHealthStatus' });
registerEnumType(AiSource, { name: 'AiSource' });

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

  @Field(() => String, { nullable: true })
  updatedAt: string | null;
}

@ObjectType()
export class AdminAiSettings {
  @Field(() => AiSource)
  source: AiSource;

  @Field(() => [AdminAiProvider])
  providers: AdminAiProvider[];
}
