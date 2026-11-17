import { checkShape, LESSON_LIMITS } from './check-shape';
import { sectionOf, syllableRun, VALID_SUMMARY, validLessonBody } from './body-fixtures';

const TITLE = 'Tử vi là gì';

describe('checkShape', () => {
  it('passes a valid lesson body', () => {
    expect(checkShape(validLessonBody(), TITLE, LESSON_LIMITS)).toEqual([]);
  });

  it('rejects a lesson with two sections or seven', () => {
    const two = {
      summary: VALID_SUMMARY,
      sections: [sectionOf('A', ['x', 'y']), sectionOf('B', ['x', 'y'])],
    };
    const seven = {
      summary: VALID_SUMMARY,
      sections: Array.from({ length: 7 }, (_, i) => sectionOf(`H${i}`, ['x', 'y'])),
    };
    expect(checkShape(two, TITLE, LESSON_LIMITS).length).toBeGreaterThan(0);
    expect(checkShape(seven, TITLE, LESSON_LIMITS).length).toBeGreaterThan(0);
  });

  it('rejects a section with too few or too many paragraphs and names the heading', () => {
    const body = {
      summary: VALID_SUMMARY,
      sections: [
        sectionOf('Một', ['chỉ một đoạn']),
        sectionOf('Hai', ['a', 'b']),
        sectionOf('Ba', ['a', 'b']),
      ],
    };
    const violations = checkShape(body, TITLE, LESSON_LIMITS);
    expect(violations.some((v) => v.includes('"Một"'))).toBe(true);
  });

  it('rejects a summary under 60 or over 160 characters', () => {
    const short = { ...validLessonBody(), summary: 'Quá ngắn.' };
    const long = { ...validLessonBody(), summary: syllableRun(200) };
    expect(checkShape(short, TITLE, LESSON_LIMITS).length).toBeGreaterThan(0);
    expect(checkShape(long, TITLE, LESSON_LIMITS).length).toBeGreaterThan(0);
  });

  it('rejects link markup in the summary or a heading', () => {
    const inSummary = {
      ...validLessonBody(),
      summary: `Xem [[sao/thien-co|sao]] ${VALID_SUMMARY}`,
    };
    const base = validLessonBody();
    const inHeading = {
      ...base,
      sections: [sectionOf('[[sao/thien-co|sao]]', ['a', 'b']), ...base.sections.slice(1)],
    };
    expect(checkShape(inSummary, TITLE, LESSON_LIMITS).length).toBeGreaterThan(0);
    expect(checkShape(inHeading, TITLE, LESSON_LIMITS).length).toBeGreaterThan(0);
  });

  it('rejects a repeated heading and a heading equal to the title', () => {
    const base = validLessonBody();
    const repeated = {
      ...base,
      sections: [
        sectionOf('Giống', ['a', 'b']),
        sectionOf('Giống', ['a', 'b']),
        sectionOf('Khác', ['a', 'b']),
      ],
    };
    const titled = {
      ...base,
      sections: [sectionOf(TITLE, ['a', 'b']), ...base.sections.slice(1)],
    };
    expect(checkShape(repeated, TITLE, LESSON_LIMITS).some((v) => v.includes('bị lặp'))).toBe(true);
    expect(
      checkShape(titled, TITLE, LESSON_LIMITS).some((v) => v.includes('trùng tên trang')),
    ).toBe(true);
  });

  it('rejects a heading over 70 characters', () => {
    const base = validLessonBody();
    const long = {
      ...base,
      sections: [sectionOf('Đây là tiêu đề '.repeat(6), ['a', 'b']), ...base.sections.slice(1)],
    };
    expect(checkShape(long, TITLE, LESSON_LIMITS).some((v) => v.includes('dài quá'))).toBe(true);
  });
});
