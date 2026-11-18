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

  it('binds a hóa to the star after it when the clause says where the hóa sits', () => {
    expect(
      checkTuHoaByCan(
        'Năm Đinh, Hóa Lộc ở Thái Âm, Hóa Quyền ở Thiên Đồng, Hóa Khoa ở Thiên Cơ, Hóa Kỵ ở Cự Môn.',
        null,
      ).violations,
    ).toEqual([]);
  });

  it('binds a hóa to the star before it when the star receives the hóa', () => {
    expect(checkTuHoaByCan('Năm Đinh, Thái Âm nhận Hóa Lộc.', null).violations).toEqual([]);
  });

  it('still rejects a wrong star placed after a hóa', () => {
    const { violations } = checkTuHoaByCan('Năm Đinh, Hóa Lộc ở Thiên Cơ.', null);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain('Thái Âm');
  });
});
