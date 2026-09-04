import { CalendarType, Gender, type BirthInput } from '@org/shared-contracts';
import {
  LOCAL_HISTORY_LIMIT,
  clearLocalHistory,
  readLocalHistory,
  recordLocalHistory,
  removeLocalHistory,
  replaceLocalHistory,
} from './local-history-store';

const STORAGE_KEY = 'tuvimienphi:la-so-history:v1';

const INPUT: BirthInput = {
  day: 12,
  month: 3,
  year: 1995,
  calendar: CalendarType.Solar,
  hour: 'Ngọ',
  gender: Gender.Male,
};

const OTHER: BirthInput = { ...INPUT, hour: 'Tý', gender: Gender.Female };

afterEach(() => {
  window.localStorage.clear();
  jest.restoreAllMocks();
});

describe('readLocalHistory', () => {
  it('starts empty', () => {
    expect(readLocalHistory()).toEqual([]);
  });

  it('survives a value that is not JSON at all', () => {
    window.localStorage.setItem(STORAGE_KEY, 'not json{');

    expect(readLocalHistory()).toEqual([]);
  });

  it('survives a value that is JSON but not a list', () => {
    window.localStorage.setItem(STORAGE_KEY, '{"day":12}');

    expect(readLocalHistory()).toEqual([]);
  });

  it('keeps the readable entries and drops only the broken one', () => {
    recordLocalHistory(INPUT);
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([{ day: 'twelve' }, ...stored]));

    const entries = readLocalHistory();

    expect(entries).toHaveLength(1);
    expect(entries[0].day).toBe(12);
  });

  it('reads as empty when the browser refuses to hand back storage', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });

    expect(readLocalHistory()).toEqual([]);
  });
});

describe('recordLocalHistory', () => {
  it('keeps the chart details alongside a key and a timestamp', () => {
    const [entry] = recordLocalHistory(INPUT, new Date('2026-02-03T04:05:06.000Z'));

    expect(entry).toMatchObject({ ...INPUT, birthKey: '1995-03-12-duong-h6-nam' });
    expect(entry.viewedAt).toBe('2026-02-03T04:05:06.000Z');
  });

  it('moves a chart already in the list back to the front instead of adding it twice', () => {
    recordLocalHistory(INPUT, new Date('2026-01-01T00:00:00.000Z'));
    recordLocalHistory(OTHER, new Date('2026-01-02T00:00:00.000Z'));
    const entries = recordLocalHistory(INPUT, new Date('2026-01-03T00:00:00.000Z'));

    expect(entries).toHaveLength(2);
    expect(entries[0].birthKey).toBe('1995-03-12-duong-h6-nam');
  });

  it('takes the newest name for a chart already in the list', () => {
    recordLocalHistory({ ...INPUT, fullName: 'Tên cũ' });

    const [entry] = recordLocalHistory({ ...INPUT, fullName: 'Tên mới' });

    expect(entry.fullName).toBe('Tên mới');
  });

  it('drops the oldest once the list is full', () => {
    for (let year = 1900; year < 1900 + LOCAL_HISTORY_LIMIT + 1; year += 1) {
      recordLocalHistory({ ...INPUT, year });
    }

    const entries = readLocalHistory();

    expect(entries).toHaveLength(LOCAL_HISTORY_LIMIT);
    expect(entries.some((entry) => entry.year === 1900)).toBe(false);
  });

  it('does not throw when the browser refuses to store anything', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    expect(() => recordLocalHistory(INPUT)).not.toThrow();
  });
});

describe('removeLocalHistory', () => {
  it('drops the chart with that key and leaves the rest', () => {
    recordLocalHistory(INPUT);
    recordLocalHistory(OTHER);

    const entries = removeLocalHistory('1995-03-12-duong-h6-nam');

    expect(entries).toHaveLength(1);
    expect(entries[0].gender).toBe(Gender.Female);
  });
});

describe('replaceLocalHistory', () => {
  it('mirrors the list it is given', () => {
    recordLocalHistory(INPUT);

    replaceLocalHistory([]);

    expect(readLocalHistory()).toEqual([]);
  });

  it('never mirrors more than the list holds', () => {
    const many = Array.from({ length: LOCAL_HISTORY_LIMIT + 5 }, (_, index) => ({
      ...INPUT,
      year: 1900 + index,
      birthKey: `key-${index}`,
      viewedAt: '2026-01-01T00:00:00.000Z',
    }));

    replaceLocalHistory(many);

    expect(readLocalHistory()).toHaveLength(LOCAL_HISTORY_LIMIT);
  });
});

describe('clearLocalHistory', () => {
  it('leaves nothing behind', () => {
    recordLocalHistory(INPUT);

    clearLocalHistory();

    expect(readLocalHistory()).toEqual([]);
  });
});
