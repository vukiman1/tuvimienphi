import { ArgsType, Field } from '@nestjs/graphql';
import { IsOptional, Matches } from 'class-validator';

export const DEFAULT_RANGE_DAYS = 14;
export const MAX_RANGE_DAYS = 366;
export const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

@ArgsType()
export class OverviewArgs {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @Matches(ISO_DATE, { message: 'from must be YYYY-MM-DD' })
  from?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Matches(ISO_DATE, { message: 'to must be YYYY-MM-DD' })
  to?: string;
}
