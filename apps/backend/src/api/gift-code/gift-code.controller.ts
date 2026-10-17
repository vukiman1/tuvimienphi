import { BadRequestException, Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { StrategyKey } from '@org/backend-constants';
import { User } from '@org/backend-decorators';
import type { RedeemGiftCodeResponse } from '@org/shared-contracts';
import { UserEntity } from '../user/entities/user.entity';
import { RedeemGiftCodeDto } from './dto/redeem-gift-code.dto';
import { REDEEM_GIFT_CODE_THROTTLE } from './gift-code.constants';
import {
  GiftCodeAlreadyRedeemedError,
  GiftCodeExpiredError,
  GiftCodeNotFoundError,
  GiftCodeUsedUpError,
} from './gift-code.errors';
import { GiftCodeService } from './gift-code.service';

type RedeemErrorType = abstract new (...args: never[]) => Error;

const REDEEM_ERROR_MESSAGES: ReadonlyArray<readonly [RedeemErrorType, string]> = [
  [GiftCodeNotFoundError, 'Mã quà tặng không đúng.'],
  [GiftCodeExpiredError, 'Mã quà tặng đã hết hạn.'],
  [GiftCodeUsedUpError, 'Mã quà tặng đã hết lượt dùng.'],
  [GiftCodeAlreadyRedeemedError, 'Bạn đã dùng mã này rồi.'],
];

@Controller('credits')
export class GiftCodeController {
  constructor(private readonly giftCodes: GiftCodeService) {}

  @Post('gift-code')
  @HttpCode(200)
  @Throttle(REDEEM_GIFT_CODE_THROTTLE)
  @UseGuards(AuthGuard(StrategyKey.JWT.USER))
  async redeem(
    @User() user: UserEntity,
    @Body() body: RedeemGiftCodeDto,
  ): Promise<RedeemGiftCodeResponse> {
    try {
      return await this.giftCodes.redeem(user.id, body.code);
    } catch (error) {
      const match = REDEEM_ERROR_MESSAGES.find(([errorType]) => error instanceof errorType);
      if (match) throw new BadRequestException(match[1]);
      throw error;
    }
  }
}
