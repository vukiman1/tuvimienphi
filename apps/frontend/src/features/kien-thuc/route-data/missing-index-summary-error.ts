export class MissingIndexSummaryError extends Error {
  constructor(readonly ref: string) {
    super(`The kiến thức search index has no summary for published page "${ref}"`);
    this.name = 'MissingIndexSummaryError';
  }
}
