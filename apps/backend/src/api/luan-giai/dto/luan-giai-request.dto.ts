import { MAX_VIEW_YEAR, MIN_BIRTH_YEAR } from '@org/shared-contracts';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { BirthInputDto } from '../../la-so/dto/birth-input.dto';

export class LuanGiaiRequestDto extends BirthInputDto {
  @IsOptional()
  @IsInt()
  @Min(MIN_BIRTH_YEAR)
  @Max(MAX_VIEW_YEAR)
  viewYear?: number;
}
