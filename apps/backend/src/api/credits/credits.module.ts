import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@org/backend-redis';
import { UserEntity } from '../user/entities/user.entity';
import { ChapterAllowanceService } from './chapter-allowance.service';
import { ChapterCreditsService } from './chapter-credits.service';
import { CreditSettingsService } from './credit-settings.service';
import { CheckoutService } from './checkout.service';
import { CreditsController } from './credits.controller';
import { DailyQuotaService } from './daily-quota.service';
import { CreditSettingsEntity } from './entities/credit-settings.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, CreditSettingsEntity]), RedisModule],
  controllers: [CreditsController],
  providers: [
    CreditSettingsService,
    DailyQuotaService,
    ChapterCreditsService,
    ChapterAllowanceService,
    CheckoutService,
  ],
  exports: [
    ChapterAllowanceService,
    ChapterCreditsService,
    CreditSettingsService,
    DailyQuotaService,
  ],
})
export class CreditsModule {}
