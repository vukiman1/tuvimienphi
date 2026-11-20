import { Injectable } from '@nestjs/common';
import { LEARNING_PROGRESS_MAX_ROWS_PER_USER } from './learning.constants';
import { LearningProgressLimitError } from './learning.errors';
import { LearningProgressStore, ProgressSaveOutcome } from './port/learning-progress.store';

@Injectable()
export class LearningProgressService {
  constructor(private readonly store: LearningProgressStore) {}

  list(userId: string): Promise<readonly string[]> {
    return this.store.listSlugs(userId);
  }

  async save(userId: string, slugs: readonly string[]): Promise<void> {
    const outcome = await this.store.saveWithinLimit(
      userId,
      slugs,
      LEARNING_PROGRESS_MAX_ROWS_PER_USER,
    );

    if (outcome === ProgressSaveOutcome.OverLimit) {
      throw new LearningProgressLimitError(userId, LEARNING_PROGRESS_MAX_ROWS_PER_USER);
    }
  }
}
