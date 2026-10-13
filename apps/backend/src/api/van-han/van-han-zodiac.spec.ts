import {
  birthYearFacts,
  birthYearOptions,
  zodiacName,
  zodiacOrderOfYear,
  zodiacOrders,
} from './van-han-zodiac';

const NGO = 7;
const MUI = 8;

describe('zodiacOrderOfYear', () => {
  it('puts 2026 under Ngọ and 2020 under Tý', () => {
    expect(zodiacName(zodiacOrderOfYear(2026))).toBe('Ngọ');
    expect(zodiacOrderOfYear(2020)).toBe(1);
  });

  it('counts twelve zodiacs starting from one', () => {
    expect(zodiacOrders()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });
});

describe('birthYearFacts', () => {
  it('names the pillar and nạp âm the public card is coloured by', () => {
    expect(birthYearFacts(1966, 2026)).toEqual({
      birthYear: 1966,
      canChi: 'Bính Ngọ',
      menh: 'Thiên Hà Thủy',
      age: 61,
    });
  });

  it('counts age the lunar way, so a child is one in the year of birth', () => {
    expect(birthYearFacts(2026, 2026).age).toBe(1);
  });
});

describe('birthYearOptions', () => {
  it('offers only years of the asked zodiac, oldest first', () => {
    const years = birthYearOptions(NGO, 2026).map((option) => option.birthYear);

    expect(years).toEqual([1930, 1942, 1954, 1966, 1978, 1990, 2002, 2014, 2026]);
  });

  it('stops at the reading year instead of offering people not born yet', () => {
    const years = birthYearOptions(MUI, 2026).map((option) => option.birthYear);

    expect(years[years.length - 1]).toBe(2015);
    expect(years.every((year) => zodiacOrderOfYear(year) === MUI)).toBe(true);
  });

  it('never reaches back before the earliest year the calendar supports', () => {
    const years = birthYearOptions(NGO, 1930).map((option) => option.birthYear);

    expect(years).toEqual([1906, 1918, 1930]);
  });
});
