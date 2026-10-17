import { GIFT_CODE_MAX_LENGTH } from '@org/shared-contracts';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RedeemGiftCodeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(GIFT_CODE_MAX_LENGTH)
  code!: string;
}
