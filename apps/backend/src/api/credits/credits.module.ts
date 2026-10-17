import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@org/backend-redis';
import { UserEntity } from '../user/entities/user.entity';
import { ChapterAllowanceService } from './chapter-allowance.service';
import { ChapterCreditsService } from './chapter-credits.service';
import { CheckoutService } from './checkout.service';
import { CreditsController } from './credits.controller';
import { DailyQuotaService } from './daily-quota.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), RedisModule],
  controllers: [CreditsController],
  providers: [DailyQuotaService, ChapterCreditsService, ChapterAllowanceService, CheckoutService],
  exports: [ChapterAllowanceService, ChapterCreditsService],
})
export class CreditsModule {}
