import { formatReviewedAt } from './reviewed-date';

describe('formatReviewedAt', () => {
  it('writes the review date day first', () => {
    expect(formatReviewedAt('2026-11-10')).toBe('10/11/2026');
  });
});
