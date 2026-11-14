import { CalendarType, Gender, birthInputSchema, birthSearchSchema } from './birth-input';

const FILLED = {
  day: 9,
  month: 3,
  year: 1994,
  calendar: CalendarType.Solar,
  hour: 'Ngọ',
  gender: Gender.Male,
} as const;

describe('birthInputSchema', () => {
  it('accepts birth details that name a real solar date', () => {
    expect(birthInputSchema.safeParse(FILLED).success).toBe(true);
  });

  it('rejects a solar day the chosen month cannot hold', () => {
    expect(birthInputSchema.safeParse({ ...FILLED, day: 31, month: 2 }).success).toBe(false);
  });

  it('accepts a lunar day the solar calendar would have rejected', () => {
    expect(
      birthInputSchema.safeParse({
        ...FILLED,
        day: 30,
        month: 2,
        year: 2002,
        calendar: CalendarType.Lunar,
      }).success,
    ).toBe(true);
  });

  it('rejects a lunar day its month does not reach', () => {
    expect(
      birthInputSchema.safeParse({
        ...FILLED,
        day: 30,
        month: 2,
        year: 2007,
        calendar: CalendarType.Lunar,
      }).success,
    ).toBe(false);
  });
});

describe('birthSearchSchema', () => {
  it('keeps the picked cung slug', () => {
    expect(birthSearchSchema.parse({ cung: 'quan-loc' }).cung).toBe('quan-loc');
  });

  it('drops a cung that is not a string instead of throwing', () => {
    expect(birthSearchSchema.parse({ cung: 12 }).cung).toBeUndefined();
  });
});
