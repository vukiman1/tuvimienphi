import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StrategyKey } from '@org/backend-constants';
import { User } from '@org/backend-decorators';
import type { CreditCheckout, CreditSummary } from '@org/shared-contracts';
import { UserEntity } from '../user/entities/user.entity';
import { ChapterAllowanceService } from './chapter-allowance.service';
import { CheckoutService } from './checkout.service';

@Controller('credits')
export class CreditsController {
  constructor(
    private readonly allowance: ChapterAllowanceService,
    private readonly checkout: CheckoutService,
  ) {}

  @Get()
  @UseGuards(AuthGuard(StrategyKey.JWT.USER))
  summary(@User() user: UserEntity): Promise<CreditSummary> {
    return this.allowance.summary(user.id);
  }

  @Get('checkout')
  @UseGuards(AuthGuard(StrategyKey.JWT.USER))
  checkoutFor(@User() user: UserEntity): Promise<CreditCheckout> {
    return this.checkout.checkoutFor(user.id);
  }
}
