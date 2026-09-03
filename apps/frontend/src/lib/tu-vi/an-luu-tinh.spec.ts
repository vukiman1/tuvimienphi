import { getYearPillar } from '@/lib/lunar-calendar';
import { anLuuTinh } from './an-luu-tinh';

/**
 * Cào từ API lưu niên của tuvi.vn. Ba lá số khác hẳn nhau cho kết quả trùng khít ở cùng một năm
 * xem, nên bảng dưới chỉ ghi theo năm xem — lưu tinh không phụ thuộc lá số gốc.
 */
const TUVI_VN: Record<number, Record<string, number>> = {
  2015: {
    'Đào Hoa': 0,
    'Thiên Khôi': 0,
    'Thiên Hư': 1,
    'Lộc Tồn': 3,
    'Bạch Hổ': 3,
    'Kình Dương': 4,
    'Thiên Mã': 5,
    'Văn Xương': 6,
    'Thái Tuế': 7,
    'Hồng Loan': 8,
    'Văn Khúc': 8,
    'Thiên Việt': 8,
    'Kiếp Sát': 8,
    'Tang Môn': 9,
    'Thiên Khốc': 11,
    'Nguyệt Đức': 0,
    'Thiên Đức': 4,
  },
  2020: {
    'Thái Tuế': 0,
    'Thiên Việt': 2,
    'Thiên Mã': 2,
    'Tang Môn': 2,
    'Hồng Loan': 3,
    'Văn Khúc': 3,
    'Kiếp Sát': 5,
    'Thiên Khôi': 6,
    'Thiên Khốc': 6,
    'Thiên Hư': 6,
    'Lộc Tồn': 8,
    'Bạch Hổ': 8,
    'Đào Hoa': 9,
    'Kình Dương': 9,
    'Văn Xương': 11,
    'Nguyệt Đức': 5,
    'Thiên Đức': 9,
  },
  2023: {
    'Đào Hoa': 0,
    'Hồng Loan': 0,
    'Lộc Tồn': 0,
    'Kình Dương': 1,
    'Văn Xương': 3,
    'Thiên Khôi': 3,
    'Thái Tuế': 3,
    'Thiên Khốc': 3,
    'Thiên Việt': 5,
    'Thiên Mã': 5,
    'Tang Môn': 5,
    'Kiếp Sát': 8,
    'Thiên Hư': 9,
    'Văn Khúc': 11,
    'Bạch Hổ': 11,
    'Nguyệt Đức': 8,
    'Thiên Đức': 0,
  },
  2026: {
    'Thiên Khốc': 0,
    'Thiên Hư': 0,
    'Bạch Hổ': 2,
    'Đào Hoa': 3,
    'Lộc Tồn': 5,
    'Văn Khúc': 6,
    'Thái Tuế': 6,
    'Kình Dương': 6,
    'Văn Xương': 8,
    'Thiên Mã': 8,
    'Tang Môn': 8,
    'Hồng Loan': 9,
    'Thiên Việt': 9,
    'Thiên Khôi': 11,
    'Kiếp Sát': 11,
    'Nguyệt Đức': 11,
    'Thiên Đức': 3,
  },
};

const placementsOf = (viewYear: number) =>
  Object.fromEntries(anLuuTinh(getYearPillar(viewYear)).map((star) => [star.name, star.chiIndex]));

describe('an lưu tinh', () => {
  for (const [viewYear, expected] of Object.entries(TUVI_VN)) {
    it(`matches tuvi.vn for the year ${viewYear}`, () => {
      expect(placementsOf(Number(viewYear))).toEqual(expected);
    });
  }

  it('leaves out Văn Xương and Văn Khúc in Đinh and Mậu years, as the source does', () => {
    // 2017 Đinh Dậu và 2018 Mậu Tuất — kiểm bốn năm can Đinh/Mậu, tuvi.vn không an hai sao này lần nào.
    for (const viewYear of [2017, 2018, 2027, 2028]) {
      const names = Object.keys(placementsOf(viewYear));
      expect(names).not.toContain('Văn Xương');
      expect(names).not.toContain('Văn Khúc');
    }
  });

  it('depends on the viewed year alone, so every chart shares one placement', () => {
    expect(placementsOf(2020)).not.toEqual(placementsOf(2021));
  });
});
