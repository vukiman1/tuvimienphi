export const TET_HUB_VIEW_YEAR = 2027;
export const TUOI_NAM_FIRST_BIRTH_YEAR = 1950;
export const TUOI_NAM_LAST_BIRTH_YEAR = 2010;

export function tuoiNamBirthYears(): readonly number[] {
  return Array.from(
    { length: TUOI_NAM_LAST_BIRTH_YEAR - TUOI_NAM_FIRST_BIRTH_YEAR + 1 },
    (_, offset) => TUOI_NAM_FIRST_BIRTH_YEAR + offset,
  );
}
