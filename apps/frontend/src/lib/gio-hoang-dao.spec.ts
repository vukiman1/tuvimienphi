import { getGioHoangDao } from './gio-hoang-dao';

describe('getGioHoangDao', () => {
  // 2026-08-11 is day Đinh Tị; the 12 hours below are from lichdungsu.
  it('matches the sao trực and hoàng/hắc đạo for day Đinh Tị', () => {
    const hours = getGioHoangDao(new Date(2026, 7, 11));

    const expected: ReadonlyArray<[string, string, boolean]> = [
      ['Canh Tý', 'Bạch Hổ', false],
      ['Tân Sửu', 'Ngọc Đường', true],
      ['Nhâm Dần', 'Thiên Lao', false],
      ['Quý Mão', 'Huyền Vũ', false],
      ['Giáp Thìn', 'Tư Mệnh', true],
      ['Ất Tị', 'Câu Trần', false],
      ['Bính Ngọ', 'Thanh Long', true],
      ['Đinh Mùi', 'Minh Đường', true],
      ['Mậu Thân', 'Thiên Hình', false],
      ['Kỷ Dậu', 'Chu Tước', false],
      ['Canh Tuất', 'Kim Quỹ', true],
      ['Tân Hợi', 'Thiên Đức', true],
    ];

    hours.forEach((hour, index) => {
      expect(hour.canChi).toBe(expected[index][0]);
      expect(hour.saoTruc).toBe(expected[index][1]);
      expect(hour.isHoangDao).toBe(expected[index][2]);
    });
  });

  it('always has six hoàng đạo and six hắc đạo hours', () => {
    const hours = getGioHoangDao(new Date(2026, 0, 1));
    expect(hours.filter((h) => h.isHoangDao)).toHaveLength(6);
  });
});
