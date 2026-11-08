import { getYearPillar, tuoiNamBirthYears } from '@org/shared-tu-vi';

export function birthYearsOfChi(chi: number): readonly number[] {
  return tuoiNamBirthYears().filter((birthYear) => getYearPillar(birthYear).chi === chi);
}
