import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AdminGiftCode {
  @Field(() => ID)
  id: string;

  @Field()
  code: string;

  @Field(() => Int)
  credits: number;

  @Field(() => Int)
  maxRedemptions: number;

  @Field(() => Int)
  redeemedCount: number;

  @Field(() => String, { nullable: true })
  expiresAt: string | null;

  @Field()
  isActive: boolean;

  @Field()
  createdByEmail: string;

  @Field()
  createdAt: string;
}
