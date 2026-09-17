import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreatePostInput {
  @Field()
  @IsString()
  title!: string;

  @Field()
  @IsString()
  slug!: string;

  @Field()
  @IsString()
  category!: string;

  @Field()
  @IsString()
  author!: string;

  @Field()
  @IsString()
  status!: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  views?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  publishedAt?: string;
}

@InputType()
export class UpdatePostInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  slug?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  category?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  author?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  views?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  publishedAt?: string;
}
