import {
  convertSolarToLunar,
  getDayCanChi,
  getMonthCanChi,
  getSolarTerm,
  getYearCanChi,
} from './lunar-calendar';

describe('convertSolarToLunar', () => {
  it('converts Tet holidays to the first lunar day', () => {
    expect(convertSolarToLunar(new Date(2024, 1, 10))).toEqual({
      day: 1,
      month: 1,
      year: 2024,
      isLeapMonth: false,
    });
    expect(convertSolarToLunar(new Date(2025, 0, 29))).toEqual({
      day: 1,
      month: 1,
      year: 2025,
      isLeapMonth: false,
    });
    expect(convertSolarToLunar(new Date(2026, 1, 17))).toEqual({
      day: 1,
      month: 1,
      year: 2026,
      isLeapMonth: false,
    });
  });

  it('converts the mid-autumn festival to the 15th of lunar month 8', () => {
    expect(convertSolarToLunar(new Date(2024, 8, 17))).toEqual({
      day: 15,
      month: 8,
      year: 2024,
      isLeapMonth: false,
    });
  });

  it('detects the 2023 leap month 2', () => {
    expect(convertSolarToLunar(new Date(2023, 2, 25))).toEqual({
      day: 4,
      month: 2,
      year: 2023,
      isLeapMonth: true,
    });
  });

  it('handles dates that fall in the previous lunar year', () => {
    expect(convertSolarToLunar(new Date(2025, 0, 28))).toEqual({
      day: 29,
      month: 12,
      year: 2024,
      isLeapMonth: false,
    });
  });
});

describe('can chi', () => {
  it('names the lunar years', () => {
    expect(getYearCanChi(2024)).toBe('Giáp Thìn');
    expect(getYearCanChi(2025)).toBe('Ất Tị');
    expect(getYearCanChi(2026)).toBe('Bính Ngọ');
  });

  it('names the first lunar month of 2025 as Mậu Dần', () => {
    expect(getMonthCanChi({ day: 1, month: 1, year: 2025, isLeapMonth: false })).toBe('Mậu Dần');
  });

  it('names the day pillar from the Julian day number', () => {
    expect(getDayCanChi(new Date(2025, 0, 29))).toBe('Mậu Tuất');
  });
});

describe('getSolarTerm', () => {
  it('returns the solar term active on a date', () => {
    expect(getSolarTerm(new Date(2026, 7, 11))).toBe('Lập Thu');
    expect(getSolarTerm(new Date(2025, 11, 22))).toBe('Đông Chí');
    expect(getSolarTerm(new Date(2025, 2, 21))).toBe('Xuân Phân');
  });
});
