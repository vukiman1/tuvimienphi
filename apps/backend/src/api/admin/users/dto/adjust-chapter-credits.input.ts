import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsUUID, Max, Min, NotEquals } from 'class-validator';

export const MAX_CREDIT_ADJUSTMENT = 1000;

@InputType()
export class AdjustChapterCreditsInput {
  @Field(() => ID)
  @IsUUID()
  userId!: string;

  @Field(() => Int)
  @IsInt()
  @NotEquals(0)
  @Min(-MAX_CREDIT_ADJUSTMENT)
  @Max(MAX_CREDIT_ADJUSTMENT)
  delta!: number;
}
