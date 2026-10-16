import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { MAX_CREDIT_ADJUSTMENT } from '@org/shared-contracts';
import { IsInt, IsUUID, Max, Min, NotEquals } from 'class-validator';

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
