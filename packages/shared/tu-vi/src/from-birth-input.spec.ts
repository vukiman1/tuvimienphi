import { CalendarType, Gender, type BirthInput } from '@org/shared-contracts';
import { natalLunarYear } from './from-birth-input.js';

const LUNAR_NEW_YEAR_EVE: Pick<BirthInput, 'day' | 'month' | 'year' | 'calendar'> = {
  day: 16,
  month: 2,
  year: 2026,
  calendar: CalendarType.Solar,
};
const LUNAR_NEW_YEAR_EVE_IN_LUNAR: Pick<BirthInput, 'day' | 'month' | 'year' | 'calendar'> = {
  day: 29,
  month: 12,
  year: 2025,
  calendar: CalendarType.Lunar,
};

describe('natalLunarYear', () => {
  it('keeps a birth late on lunar New Year eve in the old year', () => {
    expect(natalLunarYear({ ...LUNAR_NEW_YEAR_EVE, hour: 'Hợi', gender: Gender.Male })).toBe(2025);
  });

  it('moves a solar-dated birth at 23:30 on lunar New Year eve into the new year', () => {
    expect(natalLunarYear({ ...LUNAR_NEW_YEAR_EVE, hour: 'Tý sớm', gender: Gender.Male })).toBe(
      2026,
    );
  });

  it('moves a lunar-dated birth at 23:30 on lunar New Year eve into the new year', () => {
    expect(
      natalLunarYear({ ...LUNAR_NEW_YEAR_EVE_IN_LUNAR, hour: 'Tý sớm', gender: Gender.Female }),
    ).toBe(2026);
  });

  it('reads a lunar-dated birth before Tết as its own lunar year', () => {
    expect(
      natalLunarYear({ ...LUNAR_NEW_YEAR_EVE_IN_LUNAR, hour: 'Hợi', gender: Gender.Female }),
    ).toBe(2025);
  });
});
