export const PROGRESS_CARD_MIN_READ_LESSONS = 2;
export const PROGRESS_CARD_SNOOZE_MS = 604_800_000;

export interface ProgressCardRuleInput {
  readonly isAuthResolved: boolean;
  readonly isSignedIn: boolean;
  readonly readCount: number;
  readonly snoozedAt: number | null;
  readonly now: number;
}

export function isProgressCardDue(input: ProgressCardRuleInput): boolean {
  if (!input.isAuthResolved || input.isSignedIn) {
    return false;
  }
  if (input.readCount < PROGRESS_CARD_MIN_READ_LESSONS) {
    return false;
  }
  if (input.snoozedAt !== null && input.now - input.snoozedAt < PROGRESS_CARD_SNOOZE_MS) {
    return false;
  }
  return true;
}
