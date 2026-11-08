import { tuoiNamBirthYears } from './tuoi-nam-range.js';
import { conGiapSlug, findConGiapBySlug, findTuoiNamBySlug, tuoiNamSlug } from './tuoi-nam-slug.js';

const CHI_COUNT = 12;
const BIRTH_YEAR_COUNT = 61;

describe('tuoi nam slugs', () => {
  it('names pages by can chi and year', () => {
    expect(tuoiNamSlug(1986)).toBe('tuoi-binh-dan-1986');
    expect(tuoiNamSlug(1950)).toBe('tuoi-canh-dan-1950');
    expect(tuoiNamSlug(2010)).toBe('tuoi-canh-dan-2010');
    expect(conGiapSlug(2)).toBe('tuoi-dan');
  });

  it('folds đ and diacritics to ASCII', () => {
    expect(tuoiNamSlug(1987)).toBe('tuoi-dinh-mao-1987');
    expect(conGiapSlug(5)).toBe('tuoi-ti');
  });

  it('gives every birth year in range its own slug', () => {
    const slugs = tuoiNamBirthYears().map(tuoiNamSlug);
    expect(slugs).toHaveLength(BIRTH_YEAR_COUNT);
    expect(new Set(slugs).size).toBe(BIRTH_YEAR_COUNT);
  });

  it('reads a slug back to its birth year and rejects strangers', () => {
    expect(findTuoiNamBySlug('tuoi-binh-dan-1986')).toBe(1986);
    expect(findTuoiNamBySlug('tuoi-binh-dan-1987')).toBeUndefined();
    expect(findTuoiNamBySlug('tuoi-binh-dan-2046')).toBeUndefined();
    expect(findConGiapBySlug('tuoi-dan')).toBe(2);
    expect(findConGiapBySlug('tuoi-xyz')).toBeUndefined();
  });

  it('reads back every con giap slug', () => {
    for (let chi = 0; chi < CHI_COUNT; chi += 1) {
      expect(findConGiapBySlug(conGiapSlug(chi))).toBe(chi);
    }
  });
});
