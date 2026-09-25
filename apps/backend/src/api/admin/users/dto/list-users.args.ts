import { ArgsType, Field, Int } from '@nestjs/graphql';
import { Roles } from '@org/backend-enum';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { AdminUserSortField, SortDirection } from '../admin-user.sort';

export const MAX_PAGE_SIZE = 100;
export const MAX_PAGE = 10_000;
export const MAX_BALANCE = 2_147_483_647;
export const SEARCH_MAX_LENGTH = 120;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

@ArgsType()
export class ListUsersArgs {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE)
  page?: number | null;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  limit?: number | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(SEARCH_MAX_LENGTH)
  search?: string | null;

  @Field(() => [Roles], { nullable: true })
  @IsOptional()
  @IsEnum(Roles, { each: true })
  roles?: Roles[] | null;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Matches(ISO_DATE, { message: 'joinedFrom must be YYYY-MM-DD' })
  joinedFrom?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Matches(ISO_DATE, { message: 'joinedTo must be YYYY-MM-DD' })
  joinedTo?: string | null;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_BALANCE)
  balanceMin?: number | null;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_BALANCE)
  balanceMax?: number | null;

  @Field(() => AdminUserSortField, { nullable: true })
  @IsOptional()
  @IsEnum(AdminUserSortField)
  sortBy?: AdminUserSortField | null;

  @Field(() => SortDirection, { nullable: true })
  @IsOptional()
  @IsEnum(SortDirection)
  sortDirection?: SortDirection | null;
}
