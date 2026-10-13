import { ArgsType, Field, Float } from '@nestjs/graphql';
import { IsEnum, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { AiProvider } from '../../../../ai/ai-provider';

export const MIN_BUDGET_USD = 0.01;
export const MAX_BUDGET_USD = 1_000_000;

@ArgsType()
export class SetAiProviderBudgetArgs {
  @Field(() => AiProvider)
  @IsEnum(AiProvider)
  provider!: AiProvider;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(MIN_BUDGET_USD)
  @Max(MAX_BUDGET_USD)
  monthlyBudgetUsd?: number | null;
}
