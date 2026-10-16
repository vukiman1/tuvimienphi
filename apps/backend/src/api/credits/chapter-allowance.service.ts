import { Injectable } from '@nestjs/common';
import type { CreditSummary } from '@org/shared-contracts';
import { AllowanceSource } from './allowance-source.enum';
import { ChapterCreditsService } from './chapter-credits.service';
import { DAILY_CHAPTER_QUOTA } from './credits.constants';
import { DailyQuotaService } from './daily-quota.service';

@Injectable()
export class ChapterAllowanceService {
  constructor(
    private readonly daily: DailyQuotaService,
    private readonly credits: ChapterCreditsService,
  ) {}

  async consume(userId: string): Promise<AllowanceSource | null> {
    if (await this.daily.consume(userId)) return AllowanceSource.Daily;
    if (await this.credits.tryConsume(userId)) return AllowanceSource.Credit;
    return null;
  }

  async refund(userId: string, source: AllowanceSource): Promise<void> {
    if (source === AllowanceSource.Credit) {
      await this.credits.refund(userId);
      return;
    }
    await this.daily.refund(userId);
  }

  async summary(userId: string): Promise<CreditSummary> {
    const [dailyRemaining, chapterCredits] = await Promise.all([
      this.daily.remaining(userId),
      this.credits.balance(userId),
    ]);
    return { dailyLimit: DAILY_CHAPTER_QUOTA, dailyRemaining, chapterCredits };
  }
}
