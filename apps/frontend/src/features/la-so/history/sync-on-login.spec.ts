import { CalendarType, Gender } from '@org/shared-contracts';
import { laSoHistoryService } from '@/services/la-so-history-service';
import { readLocalHistory, recordLocalHistory } from './local-history-store';
import { syncLaSoHistoryOnLogin } from './sync-on-login';

jest.mock('@/services/la-so-history-service', () => ({
  laSoHistoryService: { sync: jest.fn() },
}));

const syncMock = laSoHistoryService.sync as jest.Mock;

const INPUT = {
  day: 12,
  month: 3,
  year: 1995,
  calendar: CalendarType.Solar,
  hour: 'Ngọ' as const,
  gender: Gender.Male,
};

const MERGED = {
  ...INPUT,
  birthKey: '1995-03-12-duong-h6-nam',
  viewedAt: '2026-01-01T00:00:00.000Z',
};

beforeEach(() => {
  window.localStorage.clear();
  syncMock.mockReset().mockResolvedValue({ entries: [MERGED] });
});

describe('syncLaSoHistoryOnLogin', () => {
  it('sends the local entries with the timestamps they were viewed at', async () => {
    recordLocalHistory(INPUT, new Date('2026-02-03T04:05:06.000Z'));

    await syncLaSoHistoryOnLogin();

    expect(syncMock).toHaveBeenCalledWith([
      expect.objectContaining({ day: 12, viewedAt: '2026-02-03T04:05:06.000Z' }),
    ]);
  });

  it('strips birthKey, which the server derives and refuses to be told', async () => {
    recordLocalHistory(INPUT);

    await syncLaSoHistoryOnLogin();

    expect(syncMock.mock.calls[0][0][0]).not.toHaveProperty('birthKey');
  });

  it('mirrors the merged list the server returns', async () => {
    recordLocalHistory({ ...INPUT, year: 1980 });

    await syncLaSoHistoryOnLogin();

    expect(readLocalHistory()).toEqual([expect.objectContaining({ year: 1995 })]);
  });

  it('syncs an empty list rather than skipping the fetch, so the account list still arrives', async () => {
    await syncLaSoHistoryOnLogin();

    expect(syncMock).toHaveBeenCalledWith([]);
    expect(readLocalHistory()).toHaveLength(1);
  });
});
