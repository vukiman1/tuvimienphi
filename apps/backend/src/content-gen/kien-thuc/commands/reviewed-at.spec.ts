import { reviewedAtOf } from './reviewed-at';

describe('reviewedAtOf', () => {
  it('stamps the Việt Nam date', () => {
    expect(reviewedAtOf(new Date('2026-11-14T18:30:00Z'))).toBe('2026-11-15');
    expect(reviewedAtOf(new Date('2026-11-14T16:59:00Z'))).toBe('2026-11-14');
  });
});
