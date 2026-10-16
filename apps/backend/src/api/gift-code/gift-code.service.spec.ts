import type { DataSource, EntityManager } from 'typeorm';
import { QueryFailedError } from 'typeorm';
import type { ActivityLogService } from '../activity/activity-log.service';
import type { ChapterCreditsService } from '../credits/chapter-credits.service';
import { CreditsEvent } from '../credits/credits-event';
import { GiftCodeEntity } from './entities/gift-code.entity';
import { GiftCodeRedemptionEntity } from './entities/gift-code-redemption.entity';
import {
  GiftCodeAlreadyRedeemedError,
  GiftCodeExpiredError,
  GiftCodeNotFoundError,
  GiftCodeUsedUpError,
} from './gift-code.errors';
import { GiftCodeService, normalizeGiftCode } from './gift-code.service';

const USER_ID = 'user-1';
const GIFT_CODE_ID = 'gift-1';
const CODE = 'SUMMER25';
const CREDITS = 10;
const NEW_BALANCE = 12;
const UNIQUE_VIOLATION = { code: '23505' };

const buildGiftCode = (overrides: Partial<GiftCodeEntity> = {}): GiftCodeEntity =>
  ({
    id: GIFT_CODE_ID,
    code: CODE,
    credits: CREDITS,
    maxRedemptions: 3,
    redeemedCount: 0,
    expiresAt: null,
    isActive: true,
    ...overrides,
  }) as GiftCodeEntity;

interface HarnessOptions {
  readonly giftCode?: GiftCodeEntity | null;
  readonly isAlreadyRedeemed?: boolean;
  readonly insertError?: Error;
}

const buildHarness = (options: HarnessOptions = {}) => {
  const { giftCode = buildGiftCode(), isAlreadyRedeemed = false, insertError } = options;
  const calls: string[] = [];
  const where = jest.fn().mockReturnThis();
  const setLock = jest.fn().mockImplementation(function (this: unknown) {
    calls.push('setLock');
    return this;
  });
  const getOne = jest.fn().mockImplementation(async () => {
    calls.push('getOne');
    return giftCode;
  });
  const builder = { setLock, where, getOne };
  const insert = jest.fn().mockImplementation(async () => {
    if (insertError) throw insertError;
  });
  const increment = jest.fn().mockResolvedValue(undefined);
  const exists = jest.fn().mockResolvedValue(isAlreadyRedeemed);
  const manager = {
    getRepository: jest.fn().mockReturnValue({ createQueryBuilder: () => builder }),
    exists,
    insert,
    increment,
  } as unknown as EntityManager;
  const transaction = jest.fn(async (work: (entityManager: EntityManager) => Promise<unknown>) =>
    work(manager),
  );
  const grant = jest.fn().mockResolvedValue(NEW_BALANCE);
  const record = jest.fn();
  const service = new GiftCodeService(
    { transaction } as unknown as DataSource,
    { grant } as unknown as ChapterCreditsService,
    { record } as unknown as ActivityLogService,
  );
  return { service, calls, where, setLock, insert, increment, grant, record };
};

describe('GiftCodeService.redeem', () => {
  it("grants the code's credits and counts the redemption", async () => {
    const { service, insert, increment, grant, record } = buildHarness();

    const result = await service.redeem(USER_ID, CODE);

    expect(result).toEqual({ creditsGranted: CREDITS, chapterCredits: NEW_BALANCE });
    expect(insert).toHaveBeenCalledWith(GiftCodeRedemptionEntity, {
      giftCodeId: GIFT_CODE_ID,
      userId: USER_ID,
    });
    expect(increment).toHaveBeenCalledWith(
      GiftCodeEntity,
      { id: GIFT_CODE_ID },
      'redeemedCount',
      1,
    );
    expect(grant).toHaveBeenCalledWith(USER_ID, CREDITS, expect.anything());
    expect(record).toHaveBeenCalledWith(CreditsEvent.GIFT_REDEEMED, {
      userId: USER_ID,
      metadata: { giftCodeId: GIFT_CODE_ID, code: CODE, credits: CREDITS },
    });
  });

  it('locks the code row before checking the cap', async () => {
    const { service, calls, setLock } = buildHarness();

    await service.redeem(USER_ID, CODE);

    expect(setLock).toHaveBeenCalledWith('pessimistic_write');
    expect(calls).toEqual(['setLock', 'getOne']);
  });

  it('matches codes case-insensitively', async () => {
    const { service, where } = buildHarness();

    await service.redeem(USER_ID, ' summer25 ');

    expect(where).toHaveBeenCalledWith('gift.code = :code', { code: CODE });
  });

  it('rejects an unknown code', async () => {
    const { service, grant } = buildHarness({ giftCode: null });

    await expect(service.redeem(USER_ID, CODE)).rejects.toBeInstanceOf(GiftCodeNotFoundError);
    expect(grant).not.toHaveBeenCalled();
  });

  it('rejects an inactive code as unknown', async () => {
    const { service } = buildHarness({ giftCode: buildGiftCode({ isActive: false }) });

    await expect(service.redeem(USER_ID, CODE)).rejects.toBeInstanceOf(GiftCodeNotFoundError);
  });

  it('rejects an expired code', async () => {
    const { service, grant } = buildHarness({
      giftCode: buildGiftCode({ expiresAt: new Date(Date.now() - 1000) }),
    });

    await expect(service.redeem(USER_ID, CODE)).rejects.toBeInstanceOf(GiftCodeExpiredError);
    expect(grant).not.toHaveBeenCalled();
  });

  it('rejects a code whose redemptions are used up', async () => {
    const { service, grant } = buildHarness({
      giftCode: buildGiftCode({ redeemedCount: 3, maxRedemptions: 3 }),
    });

    await expect(service.redeem(USER_ID, CODE)).rejects.toBeInstanceOf(GiftCodeUsedUpError);
    expect(grant).not.toHaveBeenCalled();
  });

  it('rejects a code the user already redeemed', async () => {
    const { service, grant } = buildHarness({ isAlreadyRedeemed: true });

    await expect(service.redeem(USER_ID, CODE)).rejects.toBeInstanceOf(
      GiftCodeAlreadyRedeemedError,
    );
    expect(grant).not.toHaveBeenCalled();
  });

  it('maps a concurrent duplicate insert to already redeemed', async () => {
    const insertError = new QueryFailedError('INSERT', [], UNIQUE_VIOLATION as unknown as Error);
    const { service, grant, record } = buildHarness({ insertError });

    await expect(service.redeem(USER_ID, CODE)).rejects.toBeInstanceOf(
      GiftCodeAlreadyRedeemedError,
    );
    expect(grant).not.toHaveBeenCalled();
    expect(record).not.toHaveBeenCalled();
  });
});

describe('normalizeGiftCode', () => {
  it('trims and uppercases', () => {
    expect(normalizeGiftCode('  summer25 ')).toBe(CODE);
  });
});
