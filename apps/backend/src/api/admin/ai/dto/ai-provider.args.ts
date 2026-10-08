import { ArgsType, Field } from '@nestjs/graphql';
import { IsEnum, IsOptional } from 'class-validator';
import { AiProvider } from '../../../../ai/ai-provider';
import { IsOptionalApiKey } from './ai-input.validators';

@ArgsType()
export class AiProviderArgs {
  @Field(() => AiProvider)
  @IsEnum(AiProvider)
  provider!: AiProvider;
}

@ArgsType()
export class AiProviderModelsArgs extends AiProviderArgs {
  @Field(() => String, { nullable: true })
  @IsOptionalApiKey()
  apiKey?: string | null;
}

@ArgsType()
export class ActiveAiProviderArgs {
  @Field(() => AiProvider, { nullable: true })
  @IsOptional()
  @IsEnum(AiProvider)
  provider?: AiProvider | null;
}
