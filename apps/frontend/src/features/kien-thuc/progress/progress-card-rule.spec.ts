import { isProgressCardDue, PROGRESS_CARD_SNOOZE_MS } from './progress-card-rule';

const base = {
  isAuthResolved: true,
  isSignedIn: false,
  readCount: 2,
  snoozedAt: null,
  now: 1_000_000_000_000,
};

describe('isProgressCardDue', () => {
  it('is due for a signed-out reader with two lessons read', () => {
    expect(isProgressCardDue(base)).toBe(true);
  });

  it('waits for one more lesson after the first', () => {
    expect(isProgressCardDue({ ...base, readCount: 1 })).toBe(false);
  });

  it('never shows to a signed-in reader', () => {
    expect(isProgressCardDue({ ...base, isSignedIn: true })).toBe(false);
  });

  it('waits for auth to resolve', () => {
    expect(isProgressCardDue({ ...base, isAuthResolved: false })).toBe(false);
  });

  it('stays hidden for seven days after Để sau', () => {
    const snoozedAt = base.now - PROGRESS_CARD_SNOOZE_MS;

    expect(isProgressCardDue({ ...base, snoozedAt: snoozedAt + 1 })).toBe(false);
    expect(isProgressCardDue({ ...base, snoozedAt })).toBe(true);
  });
});
