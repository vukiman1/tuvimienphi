export class UnknownPageRefError extends Error {
  constructor(readonly ref: string) {
    super(`không rõ trang "${ref}"`);
    this.name = 'UnknownPageRefError';
  }
}

export class UnknownBatchError extends Error {
  constructor(readonly batch: string) {
    super(`không rõ lô "${batch}"`);
    this.name = 'UnknownBatchError';
  }
}

export class InvalidKienThucArgumentError extends Error {
  constructor(readonly argument: string) {
    super(`tham số không hợp lệ "${argument}"`);
    this.name = 'InvalidKienThucArgumentError';
  }
}

export class MissingBriefTargetError extends Error {
  constructor() {
    super('brief cần một ref hoặc --batch');
    this.name = 'MissingBriefTargetError';
  }
}

export class MissingDraftError extends Error {
  constructor(readonly file: string) {
    super(`không có bản nháp tại "${file}"`);
    this.name = 'MissingDraftError';
  }
}

export class MalformedDraftError extends Error {
  constructor(
    readonly file: string,
    readonly problem: string,
  ) {
    super(`bản nháp sai định dạng tại "${file}": ${problem}`);
    this.name = 'MalformedDraftError';
  }
}

export class MalformedContentFileError extends Error {
  constructor(readonly file: string) {
    super(`tệp nội dung sai định dạng tại "${file}"`);
    this.name = 'MalformedContentFileError';
  }
}

export class UnplannedContentError extends Error {
  constructor(readonly ref: string) {
    super(`tệp nội dung "${ref}" không có trong danh mục`);
    this.name = 'UnplannedContentError';
  }
}
