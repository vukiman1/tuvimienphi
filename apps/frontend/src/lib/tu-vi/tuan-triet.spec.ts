import { anTuan, anTriet } from './tuan-triet';
import { anTuHoa } from './tu-hoa';

/** Canh Tuất 1910 — số liệu lấy nguyên từ tuvi.vn. */
const CANH_TUAT = { can: 6, chi: 10 } as const;

describe('an Tuần', () => {
  it('blocks Dần and Mão for the reference chart', () => {
    expect(anTuan(CANH_TUAT)).toEqual([2, 3]);
  });

  it('always blocks two neighbouring palaces', () => {
    for (let can = 0; can < 10; can += 1) {
      for (let chi = 0; chi < 12; chi += 1) {
        // Chỉ những cặp can chi cùng chẵn lẻ mới tồn tại trong lục thập hoa giáp.
        if ((can - chi) % 2 !== 0) {
          continue;
        }
        const [first, second] = anTuan({ can, chi });
        expect(second).toBe((first + 1) % 12);
      }
    }
  });
});

describe('an Triệt', () => {
  it('blocks Ngọ and Mùi for the reference chart', () => {
    expect(anTriet(CANH_TUAT.can)).toEqual([6, 7]);
  });

  it('repeats the same five pairs across the ten stems', () => {
    for (let can = 0; can < 5; can += 1) {
      expect(anTriet(can)).toEqual(anTriet(can + 5));
    }
  });
});

describe('an tứ hóa sinh niên', () => {
  it('gives the Canh year Nhật – Vũ – Âm – Đồng', () => {
    expect(anTuHoa(CANH_TUAT.can)).toEqual([
      { hoa: 'Hóa Lộc', star: 'Thái Dương' },
      { hoa: 'Hóa Quyền', star: 'Vũ Khúc' },
      { hoa: 'Hóa Khoa', star: 'Thái Âm' },
      { hoa: 'Hóa Kỵ', star: 'Thiên Đồng' },
    ]);
  });

  it('hands out exactly four distinct stars for every stem', () => {
    for (let can = 0; can < 10; can += 1) {
      const stars = anTuHoa(can).map((entry) => entry.star);
      expect(stars).toHaveLength(4);
      expect(new Set(stars).size).toBe(4);
    }
  });
});
