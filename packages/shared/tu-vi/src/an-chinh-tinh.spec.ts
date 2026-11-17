import {
  anChinhTinh,
  anThienPhu,
  anTuVi,
  chinhTinhChom,
  ChinhTinhChom,
  chomMembers,
} from './an-chinh-tinh.js';
import { CHINH_TINH_NAMES } from './sao-names.js';

/** Canh Tuất 1910, ngày 2 tháng 12 âm, giờ Ngọ, Mộc tam cục — số liệu lấy nguyên từ tuvi.vn. */
const LUNAR_DAY = 2;
const MOC_TAM_CUC = 3;

const SUU = 1;
const MAO = 3;

describe('an Tử Vi', () => {
  it('lands on Sửu for the reference chart', () => {
    expect(anTuVi(LUNAR_DAY, MOC_TAM_CUC)).toBe(SUU);
  });

  it('never leaves the twelve palaces, whatever the day and cục', () => {
    for (let cuc = 2; cuc <= 6; cuc += 1) {
      for (let day = 1; day <= 30; day += 1) {
        const index = anTuVi(day, cuc);
        expect(Number.isInteger(index)).toBe(true);
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(12);
      }
    }
  });

  it('lands on Dần whenever the day divides the cục exactly', () => {
    // Chia hết thì phần bù bằng 0, không cộng cũng không trừ, nên Tử Vi rơi đúng mốc đếm.
    const DAN = 2;
    expect(anTuVi(3, 3)).toBe(DAN + 0);
    expect(anTuVi(2, 2)).toBe(DAN + 0);
  });
});

describe('an Thiên Phủ', () => {
  it('mirrors Tử Vi across the Dần – Thân axis', () => {
    expect(anThienPhu(SUU)).toBe(MAO);
    // Hai cung trên trục soi gương thì trùng chính nó.
    expect(anThienPhu(2)).toBe(2);
    expect(anThienPhu(8)).toBe(8);
  });
});

describe('an mười bốn chính tinh', () => {
  it('reproduces every placement on the reference chart', () => {
    const expected: Readonly<Record<string, number>> = {
      'Tử Vi': 1, // Sửu
      'Thiên Cơ': 0, // Tý
      'Thái Dương': 10, // Tuất
      'Vũ Khúc': 9, // Dậu
      'Thiên Đồng': 8, // Thân
      'Liêm Trinh': 5, // Tị
      'Thiên Phủ': 3, // Mão
      'Thái Âm': 4, // Thìn
      'Tham Lang': 5, // Tị
      'Cự Môn': 6, // Ngọ
      'Thiên Tướng': 7, // Mùi
      'Thiên Lương': 8, // Thân
      'Thất Sát': 9, // Dậu
      'Phá Quân': 1, // Sửu
    };

    const placed = anChinhTinh(LUNAR_DAY, MOC_TAM_CUC);

    expect(placed).toHaveLength(14);
    for (const { name, chiIndex } of placed) {
      expect([name, chiIndex]).toEqual([name, expected[name]]);
    }
  });

  it('leaves Dần and Hợi empty on the reference chart', () => {
    // Hai cung vô chính diệu; nếu công thức lệch một bước thì chỗ trống này lấp đầy ngay.
    const occupied = new Set(anChinhTinh(LUNAR_DAY, MOC_TAM_CUC).map((star) => star.chiIndex));
    expect(occupied.has(2)).toBe(false);
    expect(occupied.has(11)).toBe(false);
  });
});

describe('chòm chính tinh', () => {
  it('puts six stars in chòm Tử Vi and eight in chòm Thiên Phủ', () => {
    expect(chomMembers(ChinhTinhChom.TuVi)).toEqual([
      'Tử Vi',
      'Thiên Cơ',
      'Thái Dương',
      'Vũ Khúc',
      'Thiên Đồng',
      'Liêm Trinh',
    ]);
    expect(chomMembers(ChinhTinhChom.ThienPhu)).toEqual([
      'Thiên Phủ',
      'Thái Âm',
      'Tham Lang',
      'Cự Môn',
      'Thiên Tướng',
      'Thiên Lương',
      'Thất Sát',
      'Phá Quân',
    ]);
  });

  it('assigns every chính tinh to exactly one chòm', () => {
    const tuVi = new Set(chomMembers(ChinhTinhChom.TuVi));
    const thienPhu = new Set(chomMembers(ChinhTinhChom.ThienPhu));
    for (const name of CHINH_TINH_NAMES) {
      expect(tuVi.has(name) !== thienPhu.has(name)).toBe(true);
    }
    expect(tuVi.size + thienPhu.size).toBe(CHINH_TINH_NAMES.length);
    for (const name of tuVi) {
      expect(thienPhu.has(name)).toBe(false);
    }
  });

  it('finds the chòm of a star', () => {
    expect(chinhTinhChom('Liêm Trinh')).toBe(ChinhTinhChom.TuVi);
    expect(chinhTinhChom('Phá Quân')).toBe(ChinhTinhChom.ThienPhu);
  });
});
