import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class VanHanEntry {
  @Field()
  id!: string;

  @Field(() => Int)
  year!: number;

  @Field(() => Int)
  age!: number;

  @Field()
  star!: string;

  @Field()
  rating!: string;

  @Field()
  summary!: string;

  @Field()
  updatedAt!: string;

  @Field(() => Boolean)
  published!: boolean;
}
