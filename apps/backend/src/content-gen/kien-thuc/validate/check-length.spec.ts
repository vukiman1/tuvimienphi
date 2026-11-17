import { checkLength } from './check-length';
import { CORE_ENTRY_LIMITS, ENTRY_LIMITS, LESSON_LIMITS } from './check-shape';
import { sectionOf, syllableRun, validEntryBody, validLessonBody } from './body-fixtures';

function bodyOf(paragraphSyllables: number, paragraphsPerSection: number, sections: number) {
  return {
    summary: 'Tóm tắt dùng để kiểm tra độ dài, không tính vào số âm tiết của trang.',
    sections: Array.from({ length: sections }, (_, s) =>
      sectionOf(
        `Mục ${s + 1}`,
        Array.from({ length: paragraphsPerSection }, () => syllableRun(paragraphSyllables)),
      ),
    ),
  };
}

describe('checkLength', () => {
  it('passes a valid lesson and a valid entry', () => {
    expect(checkLength(validLessonBody(), LESSON_LIMITS)).toEqual([]);
    expect(checkLength(validEntryBody(), ENTRY_LIMITS)).toEqual([]);
  });

  it('rejects a lesson under 600 or over 1,000 âm tiết with the count in the message', () => {
    const under = checkLength(bodyOf(50, 2, 3), LESSON_LIMITS);
    const over = checkLength(bodyOf(120, 4, 3), LESSON_LIMITS);
    expect(under.length).toBe(1);
    expect(under[0]).toMatch(/\d+ âm tiết/);
    expect(over.length).toBe(1);
  });

  it('rejects a chính tinh or cung entry under 450 or over 800 âm tiết', () => {
    expect(checkLength(bodyOf(100, 1, 3), CORE_ENTRY_LIMITS).length).toBe(1);
    expect(checkLength(bodyOf(300, 3, 3), CORE_ENTRY_LIMITS).length).toBe(1);
  });

  it('rejects another entry under 300 or over 700, keyed to the limits', () => {
    const body = validEntryBody();
    expect(checkLength(body, ENTRY_LIMITS)).toEqual([]);
    expect(checkLength(body, CORE_ENTRY_LIMITS).length).toBe(1);
  });

  it('does not count the summary', () => {
    const base = validEntryBody();
    const padded = { ...base, summary: `${base.summary} ${syllableRun(500)}` };
    expect(checkLength(padded, ENTRY_LIMITS)).toEqual(checkLength(base, ENTRY_LIMITS));
  });
});
