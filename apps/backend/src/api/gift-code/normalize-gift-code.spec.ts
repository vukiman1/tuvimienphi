import { normalizeGiftCode } from './normalize-gift-code';

describe('normalizeGiftCode', () => {
  it('trims and uppercases', () => {
    expect(normalizeGiftCode('  summer25 ')).toBe('SUMMER25');
  });
});
