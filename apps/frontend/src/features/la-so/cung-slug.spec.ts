import { CUNG_NAMES } from '@org/shared-tu-vi';
import { CUNG_SLUGS, cungNameFromSlug } from './cung-slug';

describe('cungNameFromSlug', () => {
  it('round-trips every cung', () => {
    for (const name of CUNG_NAMES) {
      expect(cungNameFromSlug(CUNG_SLUGS[name])).toBe(name);
    }
  });

  it('ignores an unknown slug', () => {
    expect(cungNameFromSlug('abc')).toBeNull();
  });

  it('ignores a missing slug', () => {
    expect(cungNameFromSlug(undefined)).toBeNull();
  });
});
