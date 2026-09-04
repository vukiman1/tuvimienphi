import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In } from 'typeorm';
import { CalendarType, Gender, type BirthInput } from '@org/shared-contracts';
import { LaSoHistoryEntity } from './entities/la-so-history.entity';
import { HISTORY_LIMIT, LaSoHistoryService } from './la-so-history.service';

const USER_ID = 'user-1';

const INPUT: BirthInput = {
  day: 12,
  month: 3,
  year: 1995,
  calendar: CalendarType.Solar,
  hour: 'Ngọ',
  gender: Gender.Male,
};

function row(overrides: Partial<LaSoHistoryEntity> = {}): LaSoHistoryEntity {
  return {
    userId: USER_ID,
    birthKey: '1995-03-12-duong-h6-nam',
    fullName: null,
    day: 12,
    month: 3,
    year: 1995,
    calendar: CalendarType.Solar,
    hourIndex: 6,
    gender: Gender.Male,
    viewedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  } as LaSoHistoryEntity;
}

describe('LaSoHistoryService', () => {
  let service: LaSoHistoryService;
  let repo: {
    upsert: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    repo = {
      upsert: jest.fn().mockResolvedValue(undefined),
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(row()),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LaSoHistoryService,
        { provide: getRepositoryToken(LaSoHistoryEntity), useValue: repo },
      ],
    }).compile();

    service = module.get(LaSoHistoryService);
  });

  describe('list', () => {
    it('returns the user rows newest first', async () => {
      repo.find.mockResolvedValue([row()]);

      const entries = await service.list(USER_ID);

      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: USER_ID },
          order: { viewedAt: 'DESC' },
        }),
      );
      expect(entries).toEqual([
        expect.objectContaining({ birthKey: '1995-03-12-duong-h6-nam', hour: 'Ngọ' }),
      ]);
    });

    it('hands back the hour label rather than the stored index', async () => {
      repo.find.mockResolvedValue([row({ hourIndex: 12 })]);

      const [entry] = await service.list(USER_ID);

      expect(entry.hour).toBe('Tý sớm');
    });

    it('reports a missing name as absent, not as null', async () => {
      repo.find.mockResolvedValue([row({ fullName: null })]);

      const [entry] = await service.list(USER_ID);

      expect(entry.fullName).toBeUndefined();
    });
  });

  describe('record', () => {
    it('upserts on the user and birth key so re-opening a chart does not duplicate it', async () => {
      await service.record(USER_ID, INPUT);

      expect(repo.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ userId: USER_ID, birthKey: '1995-03-12-duong-h6-nam' }),
        ['userId', 'birthKey'],
      );
    });

    it('stores the hour as its index', async () => {
      await service.record(USER_ID, INPUT);

      expect(repo.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ hourIndex: 6 }),
        expect.anything(),
      );
    });

    it('drops rows past the limit, oldest first', async () => {
      const overflow = Array.from({ length: HISTORY_LIMIT + 2 }, (_, index) =>
        row({ birthKey: `key-${index}` }),
      );
      repo.find.mockResolvedValue(overflow);

      await service.record(USER_ID, INPUT);

      expect(repo.delete).toHaveBeenCalledWith({
        userId: USER_ID,
        birthKey: In([`key-${HISTORY_LIMIT}`, `key-${HISTORY_LIMIT + 1}`]),
      });
    });

    it('leaves a list within the limit alone', async () => {
      repo.find.mockResolvedValue([row()]);

      await service.record(USER_ID, INPUT);

      expect(repo.delete).not.toHaveBeenCalled();
    });
  });

  describe('sync', () => {
    it('merges every entry in one upsert', async () => {
      await service.sync(USER_ID, [
        { ...INPUT, viewedAt: '2026-01-02T00:00:00.000Z' },
        { ...INPUT, hour: 'Tý', viewedAt: '2026-01-03T00:00:00.000Z' },
      ]);

      expect(repo.upsert).toHaveBeenCalledTimes(1);
      expect(repo.upsert.mock.calls[0][0]).toHaveLength(2);
    });

    it('keeps each entry own timestamp so the browsing order survives the merge', async () => {
      await service.sync(USER_ID, [{ ...INPUT, viewedAt: '2026-01-02T03:04:05.000Z' }]);

      expect(repo.upsert.mock.calls[0][0][0].viewedAt).toEqual(
        new Date('2026-01-02T03:04:05.000Z'),
      );
    });

    it('refuses a timestamp from the future, which only a wrong client clock produces', async () => {
      const ahead = new Date(Date.now() + 60 * 60 * 1000).toISOString();

      await service.sync(USER_ID, [{ ...INPUT, viewedAt: ahead }]);

      expect(repo.upsert.mock.calls[0][0][0].viewedAt.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('does nothing when there is nothing to merge', async () => {
      await service.sync(USER_ID, []);

      expect(repo.upsert).not.toHaveBeenCalled();
    });

    it('returns the merged list', async () => {
      repo.find.mockResolvedValue([row()]);

      const entries = await service.sync(USER_ID, []);

      expect(entries).toHaveLength(1);
    });
  });

  describe('remove', () => {
    it('scopes the delete to the caller so one user cannot erase another history', async () => {
      await service.remove(USER_ID, '1995-03-12-duong-h6-nam');

      expect(repo.delete).toHaveBeenCalledWith({
        userId: USER_ID,
        birthKey: '1995-03-12-duong-h6-nam',
      });
    });
  });
});
