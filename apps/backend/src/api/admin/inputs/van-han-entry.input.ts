import { Field, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateVanHanEntryInput {
  @Field(() => Int)
  @IsInt()
  year!: number;

  @Field(() => Int)
  @IsInt()
  age!: number;

  @Field()
  @IsString()
  star!: string;

  @Field()
  @IsString()
  rating!: string;

  @Field()
  @IsString()
  summary!: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

@InputType()
export class UpdateVanHanEntryInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  year?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  age?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  star?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  rating?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  summary?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
