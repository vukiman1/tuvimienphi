import { ZODIAC_CHI } from '@/lib/zodiac-icons';
import { vanHanZodiacPath, vanHanZodiacSlug, zodiacChiFromVanHanSlug } from './van-han-paths';

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
