import { Field, InputType, Int } from '@nestjs/graphql';
import {
  GIFT_CODE_MAX_LENGTH,
  MAX_GIFT_CODE_CREDITS,
  MAX_GIFT_CODE_REDEMPTIONS,
} from '@org/shared-contracts';
import { Transform } from 'class-transformer';
import { IsISO8601, IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator';
import { normalizeGiftCode } from '../../../gift-code/normalize-gift-code';

export const MIN_GIFT_CODE_LENGTH = 4;

const GIFT_CODE_PATTERN = new RegExp(`^[A-Z0-9]{${MIN_GIFT_CODE_LENGTH},${GIFT_CODE_MAX_LENGTH}}$`);

const normalizeOptionalCode = ({ value }: { value: unknown }): unknown => {
  if (typeof value !== 'string') return value;
  return normalizeGiftCode(value) || undefined;
};

@InputType()
export class CreateGiftCodeInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @Transform(normalizeOptionalCode)
  @IsString()
  @Matches(GIFT_CODE_PATTERN)
  code?: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(MAX_GIFT_CODE_CREDITS)
  credits!: number;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(MAX_GIFT_CODE_REDEMPTIONS)
  maxRedemptions!: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsISO8601()
  expiresAt?: string;
}
