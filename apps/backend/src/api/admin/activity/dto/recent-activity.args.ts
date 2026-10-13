import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export const DEFAULT_ACTIVITY_LIMIT = 15;
export const MAX_ACTIVITY_LIMIT = 100;
export const DEFAULT_ACTIVITY_PAGE = 1;
export const MAX_ACTIVITY_PAGE = 10_000;

@ArgsType()
export class RecentActivityArgs {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(MAX_ACTIVITY_PAGE)
  page?: number | null;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(MAX_ACTIVITY_LIMIT)
  limit?: number | null;
}
