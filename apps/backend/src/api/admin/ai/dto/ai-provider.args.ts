import { ArgsType, Field } from '@nestjs/graphql';
import { IsEnum, IsOptional } from 'class-validator';
import { AiProvider } from '../../../../ai/ai-provider';

@ArgsType()
export class AiProviderArgs {
  @Field(() => AiProvider)
  @IsEnum(AiProvider)
  provider!: AiProvider;
}

@ArgsType()
export class ActiveAiProviderArgs {
  @Field(() => AiProvider, { nullable: true })
  @IsOptional()
  @IsEnum(AiProvider)
  provider?: AiProvider | null;
}
