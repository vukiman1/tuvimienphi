import {
  PROGRESS_CARD_SNOOZE_KEY,
  readProgressCardSnooze,
  snoozeProgressCard,
  subscribeProgressCardSnooze,
} from './progress-card-snooze-store';

describe('progress card snooze store', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('remembers a snooze', () => {
    snoozeProgressCard(1_700_000_000_000);

    expect(readProgressCardSnooze()).toBe(1_700_000_000_000);
  });

  it('reads a broken value as no snooze', () => {
    window.localStorage.setItem(PROGRESS_CARD_SNOOZE_KEY, 'soon');

    expect(readProgressCardSnooze()).toBeNull();
  });

  it('tells subscribers about a snooze', () => {
    const listener = jest.fn();
    const unsubscribe = subscribeProgressCardSnooze(listener);

    snoozeProgressCard(1_700_000_000_000);

    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });
});
