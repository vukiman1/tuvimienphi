import { BadRequestException } from '@nestjs/common';
import { assertUsageRange } from './usage-range';

describe('assertUsageRange', () => {
  it('accepts a single day and a whole year', () => {
    expect(() => assertUsageRange('2026-10-07', '2026-10-07')).not.toThrow();
    expect(() => assertUsageRange('2025-10-08', '2026-10-07')).not.toThrow();
  });

  it('rejects a range that runs backwards', () => {
    expect(() => assertUsageRange('2026-10-08', '2026-10-07')).toThrow(BadRequestException);
  });

  it('rejects a range longer than a year', () => {
    expect(() => assertUsageRange('2025-10-06', '2026-10-07')).toThrow(BadRequestException);
  });

  it('rejects a day that does not exist', () => {
    expect(() => assertUsageRange('2026-13-40', '2026-10-07')).toThrow(BadRequestException);
  });
});
