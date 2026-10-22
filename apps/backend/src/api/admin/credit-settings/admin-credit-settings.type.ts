import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AdminCreditSettings {
  @Field(() => Int)
  dailyChapterQuota: number;
}
