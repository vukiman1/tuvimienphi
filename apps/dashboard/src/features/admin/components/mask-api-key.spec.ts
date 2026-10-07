import { describe, expect, it } from 'vitest';
import { keyPreview, maskApiKey } from './mask-api-key';

describe('maskApiKey', () => {
  it('keeps a few characters from each end, the way the server stores the hint', () => {
    expect(maskApiKey('AIzaSyD-very-secret-middle-part-O2Ow')).toBe('AIza…O2Ow');
  });

  it('shows only the end of a key too short to give eight characters away', () => {
    expect(maskApiKey('sk-short-key-9Zx1')).toBe('…9Zx1');
  });
});

describe('keyPreview', () => {
  it('fills the hidden middle with dots so the field reads as a key', () => {
    expect(keyPreview('AIza…O2Ow')).toBe('AIza••••••••O2Ow');
    expect(keyPreview('…9Zx1')).toBe('••••••••9Zx1');
  });

  it('still reads as a hidden key when the hint is missing or has no gap marked', () => {
    expect(keyPreview(null)).toBe('••••••••');
    expect(keyPreview('9Zx1')).toBe('••••••••9Zx1');
  });
});
