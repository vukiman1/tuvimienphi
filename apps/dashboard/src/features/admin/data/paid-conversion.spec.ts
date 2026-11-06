import { describe, expect, it } from 'vitest';
import { paidConversionPercent } from './paid-conversion';

describe('paidConversionPercent', () => {
  it('has no rate when no chart was cast', () => {
    expect(paidConversionPercent(0, 0)).toBeUndefined();
  });

  it('gives the share of casts that led to a paid unlock', () => {
    expect(paidConversionPercent(200, 25)).toBe(12.5);
  });

  it('rounds to one decimal place', () => {
    expect(paidConversionPercent(3, 1)).toBe(33.3);
  });
});
