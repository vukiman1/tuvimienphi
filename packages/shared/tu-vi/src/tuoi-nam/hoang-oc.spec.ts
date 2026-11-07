import { hoangOc, HoangOc, isHoangOcTot, HOANG_OC_TRUYEN_THONG } from './hoang-oc.js';
import { HOANG_OC_FIXTURE } from './hoang-oc.fixture.js';

describe('hoangOc', () => {
  it.each(HOANG_OC_FIXTURE)('at tuổi $tuoi follows $source', ({ tuoi, cung }) => {
    expect(hoangOc(tuoi)).toBe(cung);
  });

  it('covers all six cung in the fixture', () => {
    const covered = new Set(HOANG_OC_FIXTURE.map((entry) => entry.cung));
    expect(covered).toEqual(new Set(Object.values(HoangOc)));
  });

  it('wraps to Nhất Cát at every seventh decade', () => {
    expect(hoangOc(10)).toBe(HoangOc.NhatCat);
    expect(hoangOc(70)).toBe(HoangOc.NhatCat);
  });
});

describe('isHoangOcTot', () => {
  it.each([HoangOc.NhatCat, HoangOc.NhiNghi, HoangOc.TuTanTai])('accepts %s', (cung) => {
    expect(isHoangOcTot(cung)).toBe(true);
  });

  it.each([HoangOc.TamDiaSat, HoangOc.NguThoTu, HoangOc.LucHoangOc])('rejects %s', (cung) => {
    expect(isHoangOcTot(cung)).toBe(false);
  });
});

describe('HOANG_OC_TRUYEN_THONG', () => {
  it('is a single sentence', () => {
    expect(HOANG_OC_TRUYEN_THONG.trim().endsWith('.')).toBe(true);
    expect(HOANG_OC_TRUYEN_THONG.slice(0, -1)).not.toContain('.');
  });
});
