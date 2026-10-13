import { CHI, getNapAm, getYearCanChi, getYearPillar } from '@org/shared-tu-vi';

export const ZODIAC_COUNT = CHI.length;
export const MIN_VAN_HAN_YEAR = 1900;
export const MAX_VAN_HAN_YEAR = 2200;
export const BIRTH_YEAR_OPTION_COUNT = 9;

export interface BirthYearFacts {
  readonly birthYear: number;
  readonly canChi: string;
  readonly menh: string;
  readonly age: number;
}

export function zodiacOrders(): number[] {
  return CHI.map((_, index) => index + 1);
}

export function zodiacName(zodiacOrder: number): string {
  return CHI[zodiacOrder - 1];
}

export function zodiacOrderOfYear(year: number): number {
  return getYearPillar(year).chi + 1;
}

export function yearCanChi(year: number): string {
  return getYearCanChi(year);
}

export function birthYearFacts(birthYear: number, year: number): BirthYearFacts {
  return {
    birthYear,
    canChi: getYearCanChi(birthYear),
    menh: getNapAm(getYearPillar(birthYear)).name,
    age: year - birthYear + 1,
  };
}

export function birthYearOptions(zodiacOrder: number, year: number): BirthYearFacts[] {
  const yearsSinceZodiac = (zodiacOrderOfYear(year) - zodiacOrder + ZODIAC_COUNT) % ZODIAC_COUNT;
  const latest = year - yearsSinceZodiac;

  return Array.from(
    { length: BIRTH_YEAR_OPTION_COUNT },
    (_, index) => latest - index * ZODIAC_COUNT,
  )
    .filter((birthYear) => birthYear >= MIN_VAN_HAN_YEAR)
    .reverse()
    .map((birthYear) => birthYearFacts(birthYear, year));
}
