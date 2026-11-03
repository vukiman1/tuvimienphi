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

export class UnknownThanCuCungError extends Error {
  constructor(readonly cung: string) {
    super(`Thân cannot sit in cung "${cung}", so there is no Thân cư khung for it`);
    this.name = 'UnknownThanCuCungError';
  }
}

export class RequiredMucFailedError extends Error {
  constructor(
    readonly mucTitle: string,
    reason: string,
  ) {
    super(`required mục "${mucTitle}" could not be written: ${reason}`);
    this.name = 'RequiredMucFailedError';
  }
}

export class VanHanYearUnavailableError extends Error {
  constructor(readonly viewYear: number | null) {
    super(`chapter 06 has no vận hạn year for view year ${String(viewYear)}`);
    this.name = 'VanHanYearUnavailableError';
  }
}
