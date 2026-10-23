import { Field, InputType } from '@nestjs/graphql';
import { ArrayMinSize, IsEnum } from 'class-validator';
import { AiProvider } from '../../../../ai/port/ai-provider.enum';
import { IsModelIds, IsOptionalApiKey } from './ai-input.validators';

@InputType()
export class TestAiProviderInput {
  @Field(() => AiProvider)
  @IsEnum(AiProvider)
  provider!: AiProvider;

  @Field(() => String, { nullable: true })
  @IsOptionalApiKey()
  apiKey?: string | null;

  @Field(() => [String])
  @IsModelIds()
  @ArrayMinSize(1)
  models!: string[];
}
