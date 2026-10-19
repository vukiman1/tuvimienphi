import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { ActivityLogService } from '../../activity/activity-log.service';
import type { ChapterCreditsService } from '../../credits/chapter-credits.service';
import { CreditsEvent } from '../../credits/credits-event';
import type { DailyQuotaService } from '../../credits/daily-quota.service';
import {
  ChapterCreditsUserNotFoundError,
  ChapterCreditsWouldGoNegativeError,
} from '../../credits/credits.errors';
import type { UserEntity } from '../../user/entities/user.entity';
import type { AdminUserSummary } from './admin-user.mapper';
import { AdminUsersResolver } from './admin-users.resolver';
import type { AdminUsersService } from './admin-users.service';

const USER_ID = '2f4c1a52-6a59-4d7e-9a0e-0d3c5b8f7a11';
const ADMIN = { email: 'admin@tuvimienphi.vn' } as UserEntity;

function build(adjust: jest.Mock): { resolver: AdminUsersResolver; record: jest.Mock } {
  const record = jest.fn();
  const resolver = new AdminUsersResolver(
    {} as AdminUsersService,
    { adjust } as unknown as ChapterCreditsService,
    {} as DailyQuotaService,
    { record } as unknown as ActivityLogService,
  );
  return { resolver, record };
}

describe('AdminUsersResolver.adjustChapterCredits', () => {
  it('records who adjusted whose credits', async () => {
    const { resolver, record } = build(jest.fn().mockResolvedValue(7));

    const result = await resolver.adjustChapterCredits({ userId: USER_ID, delta: 5 }, ADMIN);

    expect(result).toEqual({ userId: USER_ID, chapterCredits: 7 });
    expect(record).toHaveBeenCalledWith(CreditsEvent.ADJUSTED, {
      userId: USER_ID,
      actorEmail: ADMIN.email,
      metadata: { delta: 5, chapterCredits: 7 },
    });
  });

  it('turns a would-be-negative adjustment into a readable error', async () => {
    const { resolver, record } = build(
      jest.fn().mockRejectedValue(new ChapterCreditsWouldGoNegativeError(USER_ID, -9)),
    );

    await expect(
      resolver.adjustChapterCredits({ userId: USER_ID, delta: -9 }, ADMIN),
    ).rejects.toThrow(new BadRequestException('Không thể trừ quá số lượt người này đang có.'));
    expect(record).not.toHaveBeenCalled();
  });

  it('turns an unknown user into a not-found error', async () => {
    const { resolver } = build(
      jest.fn().mockRejectedValue(new ChapterCreditsUserNotFoundError(USER_ID)),
    );

    await expect(
      resolver.adjustChapterCredits({ userId: USER_ID, delta: 3 }, ADMIN),
    ).rejects.toThrow(new NotFoundException('Không tìm thấy người dùng.'));
  });

  it('lets unexpected failures through untouched', async () => {
    const failure = new Error('db down');
    const { resolver } = build(jest.fn().mockRejectedValue(failure));

    await expect(resolver.adjustChapterCredits({ userId: USER_ID, delta: 3 }, ADMIN)).rejects.toBe(
      failure,
    );
  });
});

describe('AdminUsersResolver.users', () => {
  it('adds how many free lượt each listed user spent today', async () => {
    const listed = { id: USER_ID } as AdminUserSummary;
    const idle = { id: 'idle-user' } as AdminUserSummary;
    const resolver = new AdminUsersResolver(
      {
        list: jest.fn().mockResolvedValue({ total: 2, users: [listed, idle] }),
      } as unknown as AdminUsersService,
      {} as ChapterCreditsService,
      {
        usedBy: jest.fn().mockResolvedValue(new Map([[USER_ID, 2]])),
      } as unknown as DailyQuotaService,
      {} as ActivityLogService,
    );

    const page = await resolver.users({});

    expect(page.total).toBe(2);
    expect(page.users.map((user) => user.dailyChapterUsed)).toEqual([2, 0]);
  });
});
