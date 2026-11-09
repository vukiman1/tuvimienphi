import { ZODIAC_CHI } from '@/lib/zodiac-icons';
import {
  parseVanHanYear,
  vanHanYearZodiacPath,
  vanHanZodiacPath,
  vanHanZodiacSlug,
  zodiacChiFromVanHanSlug,
} from './van-han-paths';

describe('vanHanZodiacPath', () => {
  it('gives each con giáp its own page under Vận hạn', () => {
    expect(vanHanZodiacPath('Tý')).toBe('/van-han/tuoi-ty');
    expect(vanHanZodiacPath('Tị')).toBe('/van-han/tuoi-ti');
    expect(vanHanZodiacPath('Hợi')).toBe('/van-han/tuoi-hoi');
  });

  it('never gives two con giáp the same page', () => {
    const paths = ZODIAC_CHI.map(({ chi }) => vanHanZodiacPath(chi));

    expect(new Set(paths).size).toBe(ZODIAC_CHI.length);
  });
});

describe('zodiacChiFromVanHanSlug', () => {
  it('reads back the con giáp of every page', () => {
    ZODIAC_CHI.forEach(({ chi }) => {
      expect(zodiacChiFromVanHanSlug(vanHanZodiacSlug(chi))).toBe(chi);
    });
  });

  it('knows no con giáp for a slug that is not one of the 12 pages', () => {
    expect(zodiacChiFromVanHanSlug('tuoi-meo')).toBeUndefined();
  });
});

describe('vanHanYearZodiacPath', () => {
  it('puts the year of the reading in front of the con giáp', () => {
    expect(vanHanYearZodiacPath(2026, 'Tý')).toBe('/van-han/2026/tuoi-ty');
    expect(vanHanYearZodiacPath(2027, 'Hợi')).toBe('/van-han/2027/tuoi-hoi');
  });
});

describe('parseVanHanYear', () => {
  it('reads the year from the address', () => {
    expect(parseVanHanYear('2027')).toBe(2027);
  });

  it.each(['abc', '2026.5', '-2026', '02026', ''])('knows no year in %j', (value) => {
    expect(parseVanHanYear(value)).toBeUndefined();
  });
});
