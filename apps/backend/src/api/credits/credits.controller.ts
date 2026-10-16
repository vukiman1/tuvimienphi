import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StrategyKey } from '@org/backend-constants';
import { User } from '@org/backend-decorators';
import type { CreditSummary } from '@org/shared-contracts';
import { UserEntity } from '../user/entities/user.entity';
import { ChapterAllowanceService } from './chapter-allowance.service';

@Controller('credits')
export class CreditsController {
  constructor(private readonly allowance: ChapterAllowanceService) {}

  @Get()
  @UseGuards(AuthGuard(StrategyKey.JWT.USER))
  summary(@User() user: UserEntity): Promise<CreditSummary> {
    return this.allowance.summary(user.id);
  }
}
