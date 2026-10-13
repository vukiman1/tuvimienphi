import { ArgsType, Field } from '@nestjs/graphql';
import { Matches } from 'class-validator';

export const MAX_USAGE_RANGE_DAYS = 366;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

@ArgsType()
export class AiUsageArgs {
  @Field()
  @Matches(ISO_DATE, { message: 'from must be YYYY-MM-DD' })
  from!: string;

  @Field()
  @Matches(ISO_DATE, { message: 'to must be YYYY-MM-DD' })
  to!: string;
}
