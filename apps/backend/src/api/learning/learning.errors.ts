export class LearningProgressLimitError extends Error {
  constructor(userId: string, maxRows: number) {
    super(`Account ${userId} has reached the learning progress cap of ${maxRows} lessons.`);
    this.name = 'LearningProgressLimitError';
  }
}
