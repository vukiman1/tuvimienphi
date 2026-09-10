import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

const ZODIAC_COUNT = 12;
const MIN_YEAR = 1900;
const MAX_YEAR = 2200;
/** Thang sao của phần luận từng mặt. Dữ liệu đang có chạy trong 2–4; chừa biên cho đủ thang. */
const MIN_RATING = 0;
const MAX_RATING = 5;
const MAX_TITLE_LENGTH = 255;
const MAX_SOURCE_URL_LENGTH = 500;
const MAX_ZODIAC_LENGTH = 20;

class VanHanAspectDto {
  @IsString()
  aspect!: string;

  @IsInt()
  @Min(MIN_RATING)
  @Max(MAX_RATING)
  rating!: number;

  @IsString()
  body!: string;
}

class VanHanAgeReadingDto {
  @IsInt()
  @Min(MIN_YEAR)
  @Max(MAX_YEAR)
  birthYear!: number;

  @IsString()
  canChi!: string;

  @IsString()
  menh!: string;

  @IsString()
  male!: string;

  @IsString()
  female!: string;
}

export class SaveVanHanDto {
  @IsString()
  @MaxLength(MAX_ZODIAC_LENGTH)
  zodiac!: string;

  @IsInt()
  @Min(1)
  @Max(ZODIAC_COUNT)
  zodiacOrder!: number;

  @IsInt()
  @Min(MIN_YEAR)
  @Max(MAX_YEAR)
  year!: number;

  @IsString()
  @MaxLength(MAX_TITLE_LENGTH)
  title!: string;

  @IsArray()
  @IsInt({ each: true })
  bornYears!: number[];

  @IsString()
  luuNien!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VanHanAspectDto)
  luanGiai!: VanHanAspectDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VanHanAgeReadingDto)
  tungTuoi!: VanHanAgeReadingDto[];

  /** Nhập tay thì thường không có nguồn; để trống được. */
  @IsOptional()
  @IsString()
  @MaxLength(MAX_SOURCE_URL_LENGTH)
  sourceUrl?: string;
}
