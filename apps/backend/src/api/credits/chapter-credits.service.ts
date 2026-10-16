import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { UserEntity } from '../user/entities/user.entity';
import {
  ChapterCreditsUserNotFoundError,
  ChapterCreditsWouldGoNegativeError,
} from './credits.errors';

const CREDITS_COLUMN = 'chapter_credits';
const CONSUME_AMOUNT = 1;
const REFUND_AMOUNT = 1;

interface BalanceRow {
  readonly chapter_credits: number;
}

@Injectable()
export class ChapterCreditsService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async tryConsume(userId: string): Promise<boolean> {
    const result = await this.userRepo
      .createQueryBuilder()
      .update(UserEntity)
      .set({ chapterCredits: () => `${CREDITS_COLUMN} - :amount` })
      .where(`id = :userId AND ${CREDITS_COLUMN} >= :amount`, {
        userId,
        amount: CONSUME_AMOUNT,
      })
      .execute();
    return (result.affected ?? 0) > 0;
  }

  async refund(userId: string): Promise<void> {
    await this.userRepo
      .createQueryBuilder()
      .update(UserEntity)
      .set({ chapterCredits: () => `${CREDITS_COLUMN} + :amount` })
      .where('id = :userId', { userId, amount: REFUND_AMOUNT })
      .execute();
  }

  async grant(userId: string, credits: number, manager?: EntityManager): Promise<number> {
    const builder = (manager ?? this.userRepo.manager).createQueryBuilder();
    const result = await builder
      .update(UserEntity)
      .set({ chapterCredits: () => `${CREDITS_COLUMN} + :delta` })
      .where('id = :userId', { userId, delta: credits })
      .returning(CREDITS_COLUMN)
      .execute();
    const row = this.firstRow(result.raw);
    if (!row) throw new ChapterCreditsUserNotFoundError(userId);
    return row.chapter_credits;
  }

  async adjust(userId: string, delta: number): Promise<number> {
    const result = await this.userRepo
      .createQueryBuilder()
      .update(UserEntity)
      .set({ chapterCredits: () => `${CREDITS_COLUMN} + :delta` })
      .where(`id = :userId AND ${CREDITS_COLUMN} + :delta >= 0`, { userId, delta })
      .returning(CREDITS_COLUMN)
      .execute();
    const row = this.firstRow(result.raw);
    if (!row) throw new ChapterCreditsWouldGoNegativeError(userId, delta);
    return row.chapter_credits;
  }

  async balance(userId: string): Promise<number> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: { id: true, chapterCredits: true },
    });
    return user?.chapterCredits ?? 0;
  }

  private firstRow(raw: unknown): BalanceRow | undefined {
    return Array.isArray(raw) ? (raw[0] as BalanceRow | undefined) : undefined;
  }
}
