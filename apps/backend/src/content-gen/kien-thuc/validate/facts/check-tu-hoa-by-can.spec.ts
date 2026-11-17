import { checkTuHoaByCan } from './check-tu-hoa-by-can';

describe('checkTuHoaByCan', () => {
  it('accepts the Giáp row in one clause', () => {
    expect(
      checkTuHoaByCan(
        'Năm Giáp, Liêm Trinh Hóa Lộc, Phá Quân Hóa Quyền, Vũ Khúc Hóa Khoa, Thái Dương Hóa Kỵ.',
        null,
      ).violations,
    ).toEqual([]);
  });

  it('rejects a wrong star for a can', () => {
    const { violations } = checkTuHoaByCan('Năm Ất, Hóa Lộc ở Tử Vi.', null);
    expect(violations.length).toBeGreaterThan(0);
    expect(violations[0]).toContain('Thiên Cơ');
  });

  it('ignores hóa named without a can', () => {
    expect(checkTuHoaByCan('Hóa Lộc đi cùng Liêm Trinh.', null).violations).toEqual([]);
  });

  it('does not read the can Quý inside the star Thiên Quý', () => {
    expect(
      checkTuHoaByCan('Ân Quang, Thiên Quý gặp Hóa Khoa thì lợi học hành.', null).violations,
    ).toEqual([]);
  });
});
