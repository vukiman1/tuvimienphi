import type { ActivityLogService } from '../../activity/activity-log.service';
import type { CreditSettingsService } from '../../credits/credit-settings.service';
import { CreditsEvent } from '../../credits/credits-event';
import type { UserEntity } from '../../user/entities/user.entity';
import { AdminCreditSettingsResolver } from './admin-credit-settings.resolver';

const ADMIN = { email: 'admin@tuvimienphi.vn' } as UserEntity;

describe('AdminCreditSettingsResolver.updateCreditSettings', () => {
  it('saves the new daily limit and records the change from the old one', async () => {
    const settings = {
      dailyChapterQuota: jest.fn().mockResolvedValue(3),
      setDailyChapterQuota: jest.fn().mockResolvedValue(undefined),
    };
    const record = jest.fn();
    const resolver = new AdminCreditSettingsResolver(
      settings as unknown as CreditSettingsService,
      { record } as unknown as ActivityLogService,
    );

    const result = await resolver.updateCreditSettings({ dailyChapterQuota: 10 }, ADMIN);

    expect(result).toEqual({ dailyChapterQuota: 10 });
    expect(settings.setDailyChapterQuota).toHaveBeenCalledWith(10);
    expect(record).toHaveBeenCalledWith(CreditsEvent.SETTINGS_UPDATED, {
      actorEmail: ADMIN.email,
      metadata: { previousDailyChapterQuota: 3, dailyChapterQuota: 10 },
    });
  });
});
