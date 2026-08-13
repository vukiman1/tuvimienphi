import { convertSolarToLunar } from './lunar-calendar';
import { getGioXuatHanh } from './gio-xuat-hanh';

describe('getGioXuatHanh', () => {
  // 2026-08-11 is lunar 29/6; verified against lichdungsu.com/van-han.
  it('matches the known Lục Diệu hours for lunar 29/6', () => {
    const slots = getGioXuatHanh({ day: 29, month: 6, year: 2026, isLeapMonth: false });
    const byName = Object.fromEntries(slots.map((slot) => [slot.name, slot]));

    expect(byName['Đại An'].hours.map((h) => h.chi)).toEqual(['Mão', 'Dậu']);
    expect(byName['Đại An'].isGood).toBe(true);
    expect(byName['Lưu Niên'].hours.map((h) => h.chi)).toEqual(['Thìn', 'Tuất']);
    expect(byName['Lưu Niên'].isGood).toBe(false);
    expect(byName['Tốc Hỷ'].hours.map((h) => h.chi)).toEqual(['Tị', 'Hợi']);
    expect(byName['Xích Khẩu'].hours.map((h) => h.chi)).toEqual(['Ngọ', 'Tý']);
    expect(byName['Tiểu Cát'].hours.map((h) => h.chi)).toEqual(['Mùi', 'Sửu']);
    expect(byName['Không Vong'].hours.map((h) => h.chi)).toEqual(['Thân', 'Dần']);
  });

  it('always returns the six thời thần, three good and three bad', () => {
    const slots = getGioXuatHanh(convertSolarToLunar(new Date(2026, 0, 1)));
    expect(slots).toHaveLength(6);
    expect(slots.filter((slot) => slot.isGood)).toHaveLength(3);
  });

  it('pairs each hour with its opposite địa chi (6 apart)', () => {
    const chiOrder = [
      'Tý',
      'Sửu',
      'Dần',
      'Mão',
      'Thìn',
      'Tị',
      'Ngọ',
      'Mùi',
      'Thân',
      'Dậu',
      'Tuất',
      'Hợi',
    ];
    for (const slot of getGioXuatHanh({ day: 15, month: 3, year: 2026, isLeapMonth: false })) {
      const [first, second] = slot.hours.map((h) => chiOrder.indexOf(h.chi));
      expect((second - first + 12) % 12).toBe(6);
    }
  });
});
