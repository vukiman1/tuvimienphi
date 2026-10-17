import { AllowanceSource } from './allowance-source.enum';
import { ChapterAllowanceService } from './chapter-allowance.service';
import type { ChapterCreditsService } from './chapter-credits.service';
import type { DailyQuotaService } from './daily-quota.service';

function buildService(overrides?: {
  readonly isDailyAvailable?: boolean;
  readonly isCreditAvailable?: boolean;
}) {
  const daily = {
    consume: jest.fn().mockResolvedValue(overrides?.isDailyAvailable ?? true),
    refund: jest.fn().mockResolvedValue(undefined),
    remaining: jest.fn().mockResolvedValue(2),
  };
  const credits = {
    tryConsume: jest.fn().mockResolvedValue(overrides?.isCreditAvailable ?? true),
    refund: jest.fn().mockResolvedValue(undefined),
    balance: jest.fn().mockResolvedValue(7),
  };
  return {
    service: new ChapterAllowanceService(
      daily as unknown as DailyQuotaService,
      credits as unknown as ChapterCreditsService,
    ),
    daily,
    credits,
  };
}

describe('ChapterAllowanceService', () => {
  it('uses a free daily lượt first', async () => {
    const { service, credits } = buildService();

    await expect(service.consume('u1')).resolves.toBe(AllowanceSource.Daily);
    expect(credits.tryConsume).not.toHaveBeenCalled();
  });

  it('falls back to a credit when the daily lượt are gone', async () => {
    const { service } = buildService({ isDailyAvailable: false });

    await expect(service.consume('u1')).resolves.toBe(AllowanceSource.Credit);
  });

  it('returns null when both are empty', async () => {
    const { service } = buildService({ isDailyAvailable: false, isCreditAvailable: false });

    await expect(service.consume('u1')).resolves.toBeNull();
  });

  it('refunds a credit-paid lượt to the credit balance', async () => {
    const { service, daily, credits } = buildService();

    await service.refund('u1', AllowanceSource.Credit);

    expect(credits.refund).toHaveBeenCalledWith('u1');
    expect(daily.refund).not.toHaveBeenCalled();
  });

  it('refunds a daily lượt to the daily quota', async () => {
    const { service, daily, credits } = buildService();

    await service.refund('u1', AllowanceSource.Daily);

    expect(daily.refund).toHaveBeenCalledWith('u1');
    expect(credits.refund).not.toHaveBeenCalled();
  });

  it('summarises the daily limit, remaining daily lượt and credit balance', async () => {
    const { service } = buildService();

    await expect(service.summary('u1')).resolves.toEqual({
      dailyLimit: 3,
      dailyRemaining: 2,
      chapterCredits: 7,
    });
  });
});
