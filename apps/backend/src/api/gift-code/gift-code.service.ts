import { Injectable } from '@nestjs/common';
import type { RedeemGiftCodeResponse } from '@org/shared-contracts';
import { DataSource, QueryFailedError, type EntityManager } from 'typeorm';
import { ActivityLogService } from '../activity/activity-log.service';
import { ChapterCreditsService } from '../credits/chapter-credits.service';
import { CreditsEvent } from '../credits/credits-event';
import { GiftCodeEntity } from './entities/gift-code.entity';
import { GiftCodeRedemptionEntity } from './entities/gift-code-redemption.entity';
import { UNIQUE_VIOLATION_CODE } from './gift-code.constants';
import {
  GiftCodeAlreadyRedeemedError,
  GiftCodeExpiredError,
  GiftCodeNotFoundError,
  GiftCodeUsedUpError,
} from './gift-code.errors';

const REDEMPTION_INCREMENT = 1;

export const normalizeGiftCode = (raw: string): string => raw.trim().toUpperCase();

interface Redemption {
  readonly giftCode: GiftCodeEntity;
  readonly chapterCredits: number;
}

@Injectable()
export class GiftCodeService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly chapterCredits: ChapterCreditsService,
    private readonly activityLog: ActivityLogService,
  ) {}

  async redeem(userId: string, rawCode: string): Promise<RedeemGiftCodeResponse> {
    const code = normalizeGiftCode(rawCode);
    const { giftCode, chapterCredits } = await this.dataSource.transaction((manager) =>
      this.redeemWithinTransaction(manager, userId, code),
    );

    this.activityLog.record(CreditsEvent.GIFT_REDEEMED, {
      userId,
      metadata: { giftCodeId: giftCode.id, code: giftCode.code, credits: giftCode.credits },
    });
    return { creditsGranted: giftCode.credits, chapterCredits };
  }

  private async redeemWithinTransaction(
    manager: EntityManager,
    userId: string,
    code: string,
  ): Promise<Redemption> {
    const giftCode = await manager
      .getRepository(GiftCodeEntity)
      .createQueryBuilder('gift')
      .setLock('pessimistic_write')
      .where('gift.code = :code', { code })
      .getOne();
    if (!giftCode || !giftCode.isActive) throw new GiftCodeNotFoundError(code);
    if (giftCode.expiresAt && giftCode.expiresAt.getTime() < Date.now()) {
      throw new GiftCodeExpiredError(code);
    }
    if (giftCode.redeemedCount >= giftCode.maxRedemptions) throw new GiftCodeUsedUpError(code);

    const isAlreadyRedeemed = await manager.exists(GiftCodeRedemptionEntity, {
      where: { giftCodeId: giftCode.id, userId },
    });
    if (isAlreadyRedeemed) throw new GiftCodeAlreadyRedeemedError(code, userId);

    await this.insertRedemption(manager, giftCode, userId);
    await manager.increment(
      GiftCodeEntity,
      { id: giftCode.id },
      'redeemedCount',
      REDEMPTION_INCREMENT,
    );
    const chapterCredits = await this.chapterCredits.grant(userId, giftCode.credits, manager);
    return { giftCode, chapterCredits };
  }

  private async insertRedemption(
    manager: EntityManager,
    giftCode: GiftCodeEntity,
    userId: string,
  ): Promise<void> {
    try {
      await manager.insert(GiftCodeRedemptionEntity, { giftCodeId: giftCode.id, userId });
    } catch (error) {
      if (!this.isUniqueViolation(error)) throw error;
      throw new GiftCodeAlreadyRedeemedError(giftCode.code, userId);
    }
  }

  private isUniqueViolation(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) return false;
    const driverError: unknown = error.driverError;
    return (
      typeof driverError === 'object' &&
      driverError !== null &&
      (driverError as { code?: unknown }).code === UNIQUE_VIOLATION_CODE
    );
  }
}
