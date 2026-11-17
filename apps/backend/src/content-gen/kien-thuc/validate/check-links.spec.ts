import type { PageRef } from '@org/shared-contracts';
import { checkLinks } from './check-links';
import { LESSON_LIMITS } from './check-shape';
import { validLessonBody } from './body-fixtures';

const SELF: PageRef = 'bai/doc-la-so-cua-chinh-ban';

function bodyWith(paragraph: string) {
  return { summary: 'x', sections: [{ heading: 'Mục', paragraphs: [paragraph] }] };
}

describe('checkLinks', () => {
  it('accepts a lesson that links three planned pages, files or not', () => {
    expect(checkLinks(validLessonBody(), SELF, LESSON_LIMITS)).toEqual([]);
  });

  it('rejects a link to a page the plan does not have', () => {
    const violations = checkLinks(
      bodyWith('Xem [[thuat-ngu/tuan-triet|Tuần Triệt]].'),
      SELF,
      LESSON_LIMITS,
    );
    expect(violations.some((v) => v.includes('thuat-ngu/tuan-triet'))).toBe(true);
  });

  it('rejects a link to the page itself', () => {
    const violations = checkLinks(bodyWith(`Xem [[${SELF}|tự trỏ]].`), SELF, LESSON_LIMITS);
    expect(violations.some((v) => v.includes('chính trang'))).toBe(true);
  });

  it('rejects malformed markup', () => {
    const violations = checkLinks(
      bodyWith('Xem [[sao/thien-co]] thiếu nhãn.'),
      SELF,
      LESSON_LIMITS,
    );
    expect(violations.some((v) => v.includes('hỏng'))).toBe(true);
  });

  it('rejects a lesson with two link targets', () => {
    const body = bodyWith('Xem [[sao/thien-co|a]] và [[cung/menh|b]].');
    expect(checkLinks(body, SELF, LESSON_LIMITS).some((v) => v.includes('ít nhất 3'))).toBe(true);
  });

  it('counts distinct targets, not links', () => {
    const body = bodyWith('Xem [[sao/thien-co|a]], [[sao/thien-co|b]] và [[cung/menh|c]].');
    expect(checkLinks(body, SELF, LESSON_LIMITS).some((v) => v.includes('ít nhất 3'))).toBe(true);
  });
});
