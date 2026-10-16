import { parseSepayTransactionDate } from './sepay-transaction-date';

describe('parseSepayTransactionDate', () => {
  it('reads the timestamp as Vietnam local time', () => {
    expect(parseSepayTransactionDate('2026-10-16 10:00:00').toISOString()).toBe(
      '2026-10-16T03:00:00.000Z',
    );
  });

  it('rolls back to the previous UTC day for early morning transfers', () => {
    expect(parseSepayTransactionDate('2026-10-16 01:30:00').toISOString()).toBe(
      '2026-10-15T18:30:00.000Z',
    );
  });
});
