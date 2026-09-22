import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export const MAX_PAGE_SIZE = 100;
export const MAX_PAGE = 10_000;

@ArgsType()
export class ListUsersArgs {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE)
  page?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  limit?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}
