import { CalendarType, Gender, MAX_NAME_LENGTH } from '@/features/la-so/birth-input';
import { EMPTY_HERO_BIRTH_FORM, heroBirthSchema, toBirthSearch } from './hero-birth-schema';

const FILLED = {
  fullName: 'Nguyễn Văn A',
  day: '9',
  month: '3',
  year: '1994',
  calendar: CalendarType.Solar,
  hour: 'Ngọ',
  gender: Gender.Male,
} as const;

describe('hero birth form', () => {
  it('rejects an empty form', () => {
    expect(heroBirthSchema.safeParse(EMPTY_HERO_BIRTH_FORM).success).toBe(false);
  });

  it('rejects a day the chosen month cannot hold', () => {
    expect(heroBirthSchema.safeParse({ ...FILLED, day: '30', month: '2' }).success).toBe(false);
  });

  it('accepts 29 February in a leap year', () => {
    expect(
      heroBirthSchema.safeParse({ ...FILLED, day: '29', month: '2', year: '1996' }).success,
    ).toBe(true);
  });

  it('rejects 29 February outside a leap year', () => {
    expect(
      heroBirthSchema.safeParse({ ...FILLED, day: '29', month: '2', year: '1995' }).success,
    ).toBe(false);
  });

  it('accepts a fully filled form', () => {
    expect(heroBirthSchema.safeParse(FILLED).success).toBe(true);
  });

  it('accepts a form with no name, since the name is optional', () => {
    expect(heroBirthSchema.safeParse({ ...FILLED, fullName: '' }).success).toBe(true);
  });

  it('still rejects a name past the length cap', () => {
    const tooLong = 'a'.repeat(MAX_NAME_LENGTH + 1);

    expect(heroBirthSchema.safeParse({ ...FILLED, fullName: tooLong }).success).toBe(false);
  });

  it('leaves the name out of the search entirely when it is blank', () => {
    expect(toBirthSearch({ ...FILLED, fullName: '   ' })).not.toHaveProperty('fullName');
  });

  it('turns form strings into the numbers /la-so reads', () => {
    expect(toBirthSearch(FILLED)).toEqual({
      fullName: 'Nguyễn Văn A',
      day: 9,
      month: 3,
      year: 1994,
      calendar: CalendarType.Solar,
      hour: 'Ngọ',
      gender: Gender.Male,
    });
  });

  it('trims surrounding spaces off the name', () => {
    expect(toBirthSearch({ ...FILLED, fullName: '  Trần Thị B  ' }).fullName).toBe('Trần Thị B');
  });
});
