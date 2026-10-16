import type { Repository } from 'typeorm';
import type { UserEntity } from '../user/entities/user.entity';
import { ChapterCreditsService } from './chapter-credits.service';
import {
  ChapterCreditsUserNotFoundError,
  ChapterCreditsWouldGoNegativeError,
} from './credits.errors';

interface UpdateResult {
  readonly affected?: number;
  readonly raw?: readonly { chapter_credits: number }[];
}

const buildService = (result: UpdateResult, isUserPresent = true): ChapterCreditsService => {
  const builder = {
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    returning: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue(result),
  };
  const repo = {
    createQueryBuilder: jest.fn().mockReturnValue(builder),
    existsBy: jest.fn().mockResolvedValue(isUserPresent),
    manager: { createQueryBuilder: jest.fn().mockReturnValue(builder) },
  } as unknown as Repository<UserEntity>;
  return new ChapterCreditsService(repo);
};

describe('ChapterCreditsService', () => {
  it('spends one credit when the balance is positive', async () => {
    const service = buildService({ affected: 1 });
    await expect(service.tryConsume('u1')).resolves.toBe(true);
  });

  it('refuses when the balance is zero', async () => {
    const service = buildService({ affected: 0 });
    await expect(service.tryConsume('u1')).resolves.toBe(false);
  });

  it('rejects an adjustment that would go below zero', async () => {
    const service = buildService({ raw: [] });
    await expect(service.adjust('u1', -3)).rejects.toBeInstanceOf(
      ChapterCreditsWouldGoNegativeError,
    );
  });

  it('reports a missing user instead of a negative balance when adjusting', async () => {
    const service = buildService({ raw: [] }, false);
    await expect(service.adjust('ghost', 5)).rejects.toBeInstanceOf(
      ChapterCreditsUserNotFoundError,
    );
  });

  it('returns the new balance after a grant', async () => {
    const service = buildService({ raw: [{ chapter_credits: 8 }] });
    await expect(service.grant('u1', 5)).resolves.toBe(8);
  });
});
