import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsEnum, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';
import { AiProvider } from '../../../../ai/ai-provider';
import { AiUsagePurpose } from '../../../../ai/ai-usage-purpose.enum';

export const DEFAULT_CALLS_PAGE_SIZE = 20;
export const MAX_CALLS_PAGE_SIZE = 100;
export const MAX_CALLS_PAGE = 10_000;

const MAX_MODEL_LENGTH = 60;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

@ArgsType()
export class AiCallsArgs {
  @Field()
  @Matches(ISO_DATE, { message: 'from must be YYYY-MM-DD' })
  from!: string;

  @Field()
  @Matches(ISO_DATE, { message: 'to must be YYYY-MM-DD' })
  to!: string;

  @Field(() => AiProvider)
  @IsEnum(AiProvider)
  provider!: AiProvider;

  @Field()
  @IsString()
  @MaxLength(MAX_MODEL_LENGTH)
  model!: string;

  @Field(() => AiUsagePurpose)
  @IsEnum(AiUsagePurpose)
  purpose!: AiUsagePurpose;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(MAX_CALLS_PAGE)
  page?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(MAX_CALLS_PAGE_SIZE)
  limit?: number;
}
