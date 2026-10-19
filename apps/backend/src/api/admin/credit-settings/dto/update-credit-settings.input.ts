import { Field, InputType, Int } from '@nestjs/graphql';
import { MAX_DAILY_CHAPTER_QUOTA } from '@org/shared-contracts';
import { IsInt, Max, Min } from 'class-validator';

@InputType()
export class UpdateCreditSettingsInput {
  @Field(() => Int)
  @IsInt()
  @Min(0)
  @Max(MAX_DAILY_CHAPTER_QUOTA)
  dailyChapterQuota!: number;
}
