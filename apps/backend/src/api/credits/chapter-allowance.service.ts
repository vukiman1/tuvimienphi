import { Injectable } from '@nestjs/common';
import type { CreditSummary } from '@org/shared-contracts';
import { AllowanceSource } from './allowance-source.enum';
import { ChapterCreditsService } from './chapter-credits.service';
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
    const [daily, chapterCredits] = await Promise.all([
      this.daily.status(userId),
      this.credits.balance(userId),
    ]);
    return { dailyLimit: daily.limit, dailyRemaining: daily.remaining, chapterCredits };
  }
}
