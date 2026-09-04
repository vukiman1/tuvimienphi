import {
  BIRTH_HOURS,
  CalendarType,
  Gender,
  birthHourIndex,
  birthKey,
  type BirthInput,
} from './birth-input.js';

const INPUT: BirthInput = {
  day: 12,
  month: 3,
  year: 1995,
  calendar: CalendarType.Solar,
  hour: 'Ngọ',
  gender: Gender.Male,
};

describe('birthKey', () => {
  it('pads day and month so keys of the same date always match', () => {
    expect(birthKey(INPUT)).toBe('1995-03-12-duong-h6-nam');
  });

  it('ignores the name so renaming keeps the same chart', () => {
    expect(birthKey({ ...INPUT, fullName: 'Nguyễn Văn A' })).toBe(birthKey(INPUT));
  });

  it('separates the two halves of giờ Tý', () => {
    expect(birthKey({ ...INPUT, hour: 'Tý' })).not.toBe(birthKey({ ...INPUT, hour: 'Tý sớm' }));
  });

  it('separates lunar from solar dates', () => {
    expect(birthKey({ ...INPUT, calendar: CalendarType.Lunar })).not.toBe(birthKey(INPUT));
  });

  it('separates genders', () => {
    expect(birthKey({ ...INPUT, gender: Gender.Female })).not.toBe(birthKey(INPUT));
  });

  it('stays free of characters that would need escaping in a URL or a database key', () => {
    for (const { key } of BIRTH_HOURS) {
      expect(birthKey({ ...INPUT, hour: key })).toMatch(/^[a-z0-9-]+$/);
    }
  });
});

describe('birthHourIndex', () => {
  it('maps every hour to its position in clock order', () => {
    expect(BIRTH_HOURS.map(({ key }) => birthHourIndex(key))).toEqual(
      BIRTH_HOURS.map((_, index) => index),
    );
  });
});
