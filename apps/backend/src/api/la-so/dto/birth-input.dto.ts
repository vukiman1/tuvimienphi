import {
  BIRTH_HOUR_KEYS,
  CalendarType,
  DAYS_IN_LONGEST_MONTH,
  Gender,
  MAX_NAME_LENGTH,
  MAX_STORED_BIRTH_YEAR,
  MIN_BIRTH_YEAR,
  MONTHS_IN_YEAR,
  type BirthHourKey,
} from '@org/shared-contracts';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

/** Guards the payload shape only. Whether a lunar date exists is settled by the form, which owns
 * the calendar tables; duplicating them here would mean shipping a lunar library to the API. */
export class BirthInputDto {
  @IsOptional()
  @IsString()
  @MaxLength(MAX_NAME_LENGTH)
  fullName?: string;

  @IsInt()
  @Min(1)
  @Max(DAYS_IN_LONGEST_MONTH)
  day!: number;

  @IsInt()
  @Min(1)
  @Max(MONTHS_IN_YEAR)
  month!: number;

  @IsInt()
  @Min(MIN_BIRTH_YEAR)
  @Max(MAX_STORED_BIRTH_YEAR)
  year!: number;

  @IsEnum(CalendarType)
  calendar!: CalendarType;

  @IsIn(BIRTH_HOUR_KEYS)
  hour!: BirthHourKey;

  @IsEnum(Gender)
  gender!: Gender;
}

export class SyncBirthInputDto extends BirthInputDto {
  @IsDateString()
  viewedAt!: string;
}

/** One page of local history at most — the browser store is capped well below this. */
export const MAX_SYNC_ENTRIES = 100;

export class SyncLaSoHistoryDto {
  @IsArray()
  @ArrayMaxSize(MAX_SYNC_ENTRIES)
  @ValidateNested({ each: true })
  @Type(() => SyncBirthInputDto)
  entries!: SyncBirthInputDto[];
}
