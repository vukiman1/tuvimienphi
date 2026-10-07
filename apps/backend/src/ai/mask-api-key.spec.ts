import { MAX_MASK_LENGTH, maskApiKey } from './mask-api-key';

describe('maskApiKey', () => {
  it('keeps a few characters from each end of a real key and nothing in between', () => {
    const masked = maskApiKey('AIzaSyD-very-secret-middle-part-of-the-key-O2Ow');

    expect(masked).toBe('AIza…O2Ow');
    expect(masked).not.toContain('secret');
  });

  it('shows only the end of a key too short to give eight characters away', () => {
    expect(maskApiKey('sk-short-key-9Zx1')).toBe('…9Zx1');
  });

  it('never grows past what the column holds', () => {
    expect(maskApiKey('k'.repeat(400)).length).toBeLessThanOrEqual(MAX_MASK_LENGTH);
  });
});
