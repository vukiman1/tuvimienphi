import { countSyllables, readingMinutes } from './syllable-count';

describe('countSyllables', () => {
  it('counts tokens that hold a letter or digit', () => {
    expect(countSyllables('Thiên Cơ – sao số 2.')).toBe(5);
  });

  it('counts a link as its label', () => {
    expect(countSyllables('[[sao/thien-co|Thiên Cơ]] hay')).toBe(3);
  });
});

describe('readingMinutes', () => {
  it('rounds reading time up at 180 âm tiết a minute', () => {
    expect(readingMinutes(600)).toBe(4);
    expect(readingMinutes(1000)).toBe(6);
    expect(readingMinutes(450)).toBe(3);
    expect(readingMinutes(180)).toBe(1);
    expect(readingMinutes(181)).toBe(2);
  });
});
