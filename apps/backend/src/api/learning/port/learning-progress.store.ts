export enum ProgressSaveOutcome {
  Saved = 'saved',
  OverLimit = 'over-limit',
}

export abstract class LearningProgressStore {
  abstract listSlugs(userId: string): Promise<readonly string[]>;
  abstract saveWithinLimit(
    userId: string,
    slugs: readonly string[],
    maxRows: number,
  ): Promise<ProgressSaveOutcome>;
}
