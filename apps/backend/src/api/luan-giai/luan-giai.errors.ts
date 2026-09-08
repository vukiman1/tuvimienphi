export class MalformedChapterError extends Error {
  constructor(readonly raw: string) {
    super('model returned something that is not the expected two-paragraph object');
    this.name = 'MalformedChapterError';
  }
}

export class ChapterRejectedError extends Error {
  constructor(
    readonly attempts: number,
    readonly violations: readonly string[],
  ) {
    super(`chapter still failed the checks after ${attempts} attempts: ${violations.join('; ')}`);
    this.name = 'ChapterRejectedError';
  }
}

export class ChapterTimedOutError extends Error {
  constructor(
    readonly attempts: number,
    readonly violations: readonly string[],
  ) {
    super(`ran out of time budget after ${attempts} attempts`);
    this.name = 'ChapterTimedOutError';
  }
}
