import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsInt, Max, Min } from 'class-validator';
import { MAX_VAN_HAN_YEAR, MIN_VAN_HAN_YEAR, ZODIAC_COUNT } from '../../../van-han/van-han-zodiac';

@ArgsType()
export class VanHanYearArgs {
  @Field(() => Int)
  @IsInt()
  @Min(MIN_VAN_HAN_YEAR)
  @Max(MAX_VAN_HAN_YEAR)
  year!: number;
}

@ArgsType()
export class VanHanSlotArgs extends VanHanYearArgs {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(ZODIAC_COUNT)
  zodiacOrder!: number;
}
