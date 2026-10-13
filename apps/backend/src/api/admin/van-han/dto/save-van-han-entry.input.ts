import { Field, InputType, Int } from '@nestjs/graphql';
import { VAN_HAN_ASPECTS, VAN_HAN_MAX_RATING, VAN_HAN_TEXT_LIMITS } from '@org/shared-contracts';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  BIRTH_YEAR_OPTION_COUNT,
  MAX_VAN_HAN_YEAR,
  MIN_VAN_HAN_YEAR,
  ZODIAC_COUNT,
} from '../../../van-han/van-han-zodiac';

const MIN_RATING = 0;

@InputType()
export class VanHanAspectInput {
  @Field()
  @IsIn(VAN_HAN_ASPECTS)
  aspect!: string;

  @Field(() => Int)
  @IsInt()
  @Min(MIN_RATING)
  @Max(VAN_HAN_MAX_RATING)
  rating!: number;

  @Field()
  @IsString()
  @MaxLength(VAN_HAN_TEXT_LIMITS.aspectBody)
  body!: string;
}

@InputType()
export class VanHanAgeInput {
  @Field(() => Int)
  @IsInt()
  @Min(MIN_VAN_HAN_YEAR)
  @Max(MAX_VAN_HAN_YEAR)
  birthYear!: number;

  @Field()
  @IsString()
  @MaxLength(VAN_HAN_TEXT_LIMITS.ageReading)
  male!: string;

  @Field()
  @IsString()
  @MaxLength(VAN_HAN_TEXT_LIMITS.ageReading)
  female!: string;
}

@InputType()
export class SaveVanHanEntryInput {
  @Field(() => Int)
  @IsInt()
  @Min(MIN_VAN_HAN_YEAR)
  @Max(MAX_VAN_HAN_YEAR)
  year!: number;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(ZODIAC_COUNT)
  zodiacOrder!: number;

  @Field()
  @IsString()
  @MaxLength(VAN_HAN_TEXT_LIMITS.luuNien)
  luuNien!: string;

  @Field(() => [VanHanAspectInput])
  @IsArray()
  @ArrayMaxSize(VAN_HAN_ASPECTS.length)
  @ArrayUnique((aspect: VanHanAspectInput) => aspect.aspect)
  @ValidateNested({ each: true })
  @Type(() => VanHanAspectInput)
  luanGiai!: VanHanAspectInput[];

  @Field(() => [VanHanAgeInput])
  @IsArray()
  @ArrayMaxSize(BIRTH_YEAR_OPTION_COUNT)
  @ArrayUnique((age: VanHanAgeInput) => age.birthYear)
  @ValidateNested({ each: true })
  @Type(() => VanHanAgeInput)
  tungTuoi!: VanHanAgeInput[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(VAN_HAN_TEXT_LIMITS.sourceUrl)
  sourceUrl?: string | null;
}
