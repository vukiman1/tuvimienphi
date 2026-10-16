export class ChapterCreditsWouldGoNegativeError extends Error {
  constructor(userId: string, delta: number) {
    super(`Chapter credits adjustment of ${delta} for user ${userId} would go below zero`);
    this.name = 'ChapterCreditsWouldGoNegativeError';
  }
}

export class ChapterCreditsUserNotFoundError extends Error {
  constructor(userId: string) {
    super(`Cannot grant chapter credits: user ${userId} not found`);
    this.name = 'ChapterCreditsUserNotFoundError';
  }
}
