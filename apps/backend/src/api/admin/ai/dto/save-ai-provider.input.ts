import { Field, InputType } from '@nestjs/graphql';
import { IsEnum } from 'class-validator';
import { AiProvider } from '../../../../ai/ai-provider';
import { IsModelIds, IsOptionalApiKey } from './ai-input.validators';

@InputType()
export class SaveAiProviderInput {
  @Field(() => AiProvider)
  @IsEnum(AiProvider)
  provider!: AiProvider;

  @Field(() => String, { nullable: true })
  @IsOptionalApiKey()
  apiKey?: string | null;

  @Field(() => [String])
  @IsModelIds()
  models!: string[];
}
