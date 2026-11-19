import {
  LOCAL_PROGRESS_KEY,
  LOCAL_PROGRESS_LIMIT,
  clearLocalProgress,
  markLessonRead,
  readLocalProgress,
  subscribeLocalProgress,
} from './local-progress-store';

function writeOtherTab(value: string): void {
  window.localStorage.setItem(LOCAL_PROGRESS_KEY, value);
  window.dispatchEvent(new StorageEvent('storage', { key: LOCAL_PROGRESS_KEY }));
}

let unsubscribeTabSync: () => void;

beforeEach(() => {
  clearLocalProgress();
  unsubscribeTabSync = subscribeLocalProgress(() => undefined);
});

afterEach(() => {
  unsubscribeTabSync();
  jest.restoreAllMocks();
});

describe('local progress store', () => {
  it('stores read lessons under the versioned key', () => {
    markLessonRead('tu-vi-la-gi');

    expect(JSON.parse(window.localStorage.getItem(LOCAL_PROGRESS_KEY) ?? '')).toEqual([
      'tu-vi-la-gi',
    ]);
    expect(readLocalProgress().has('tu-vi-la-gi')).toBe(true);
  });

  it('keeps each lesson once', () => {
    markLessonRead('tu-vi-la-gi');
    markLessonRead('tu-vi-la-gi');

    expect(JSON.parse(window.localStorage.getItem(LOCAL_PROGRESS_KEY) ?? '')).toEqual([
      'tu-vi-la-gi',
    ]);
  });

  it.each(['{', '42', '["Bad Slug", 7]'])('reads a broken store %s as empty', (stored) => {
    expect(() => writeOtherTab(stored)).not.toThrow();

    expect(readLocalProgress().size).toBe(0);
  });

  it('drops invalid items one by one and keeps the valid ones', () => {
    writeOtherTab('["can", "Bad Slug", 7, "chi"]');

    expect([...readLocalProgress()]).toEqual(['can', 'chi']);
  });

  it('reads without throwing when storage is blocked', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });

    expect(() => writeOtherTab('["can"]')).not.toThrow();
    expect(readLocalProgress().size).toBe(0);
  });

  it('returns the same snapshot until the list changes', () => {
    const first = readLocalProgress();

    expect(readLocalProgress()).toBe(first);

    markLessonRead('can');

    expect(readLocalProgress()).not.toBe(first);
  });

  it("notifies subscribers on a mark, a clear and another tab's write", () => {
    const listener = jest.fn();
    const unsubscribe = subscribeLocalProgress(listener);

    markLessonRead('can');
    expect(listener).toHaveBeenCalledTimes(1);

    clearLocalProgress();
    expect(listener).toHaveBeenCalledTimes(2);

    writeOtherTab('["chi"]');
    expect(listener).toHaveBeenCalledTimes(3);
    expect(readLocalProgress().has('chi')).toBe(true);

    unsubscribe();
    markLessonRead('nhat-chu');
    expect(listener).toHaveBeenCalledTimes(3);
  });

  it("keeps another tab's write that landed while nothing was subscribed", () => {
    unsubscribeTabSync();
    writeOtherTab('["chi"]');

    unsubscribeTabSync = subscribeLocalProgress(() => undefined);
    expect(readLocalProgress().has('chi')).toBe(true);

    markLessonRead('can');
    expect(JSON.parse(window.localStorage.getItem(LOCAL_PROGRESS_KEY) ?? '')).toEqual([
      'chi',
      'can',
    ]);
  });

  it("keeps the session's marks when storage refuses the write", () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });

    expect(() => markLessonRead('x-y')).not.toThrow();
    expect(readLocalProgress().has('x-y')).toBe(true);
  });

  it('caps the set at 200 slugs and drops the oldest', () => {
    const slugs = Array.from({ length: LOCAL_PROGRESS_LIMIT + 1 }, (_, index) => `bai-${index}`);

    slugs.forEach(markLessonRead);

    expect(readLocalProgress().size).toBe(LOCAL_PROGRESS_LIMIT);
    expect(readLocalProgress().has('bai-0')).toBe(false);
    expect(readLocalProgress().has('bai-200')).toBe(true);
  });
});
