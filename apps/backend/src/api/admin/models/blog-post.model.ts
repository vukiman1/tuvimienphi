import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class BlogPost {
  @Field()
  id!: string;

  @Field()
  title!: string;

  @Field()
  slug!: string;

  @Field()
  category!: string;

  @Field()
  author!: string;

  @Field()
  status!: string;

  @Field(() => Int)
  views!: number;

  @Field()
  updatedAt!: string;

  @Field(() => String, { nullable: true })
  publishedAt?: string | null;
}
