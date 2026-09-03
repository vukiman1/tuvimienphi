import { anCuc, anCungMenh, anCungThan, anLaiNhanCung, cungCanChi, cungNameAt } from './dia-ban';

/**
 * Lá số đối chiếu: Canh Tuất 1910, ngày 2 tháng 12 âm, giờ Ngọ, Dương Nam — cùng lá số mà giao diện
 * đang dùng làm dữ liệu mẫu, số liệu lấy nguyên từ tuvi.vn.
 */
const CANH_TUAT = {
  yearCan: 6, // Canh
  lunarMonth: 12,
  lunarDay: 2,
  hourChi: 6, // Ngọ
} as const;

const MUI = 7;
const DAN = 2;

describe('an cung Mệnh và cung Thân', () => {
  it('places Mệnh and Thân on Mùi for the reference chart', () => {
    expect(anCungMenh(CANH_TUAT.lunarMonth, CANH_TUAT.hourChi)).toBe(MUI);
    expect(anCungThan(CANH_TUAT.lunarMonth, CANH_TUAT.hourChi)).toBe(MUI);
  });

  it('puts Thân on Mệnh only for the Tý and Ngọ hours', () => {
    for (let month = 1; month <= 12; month += 1) {
      for (let hour = 0; hour < 12; hour += 1) {
        const together = anCungMenh(month, hour) === anCungThan(month, hour);
        expect(together).toBe(hour === 0 || hour === 6);
      }
    }
  });
});

describe('tên mười hai cung', () => {
  it('reads the twelve palaces counter-clockwise from Mệnh', () => {
    // Đối chiếu từng cung với lá số gốc: Mệnh ở Mùi thì Quan Lộc phải rơi vào Hợi.
    const expected: ReadonlyArray<readonly [number, string]> = [
      [7, 'Mệnh'],
      [8, 'Phụ Mẫu'],
      [9, 'Phúc Đức'],
      [10, 'Điền Trạch'],
      [11, 'Quan Lộc'],
      [0, 'Nô Bộc'],
      [1, 'Thiên Di'],
      [2, 'Tật Ách'],
      [3, 'Tài Bạch'],
      [4, 'Tử Tức'],
      [5, 'Phu Thê'],
      [6, 'Huynh Đệ'],
    ];

    for (const [chi, name] of expected) {
      expect(cungNameAt(chi, MUI)).toBe(name);
    }
  });
});

describe('can của cung theo ngũ hổ độn', () => {
  it('starts the Canh year at Mậu Dần', () => {
    expect(cungCanChi(DAN, CANH_TUAT.yearCan)).toBe('Mậu Dần');
  });

  it('gives the reference chart Quý Mùi at the Mệnh palace', () => {
    expect(cungCanChi(MUI, CANH_TUAT.yearCan)).toBe('Quý Mùi');
  });

  it('wraps past Hợi before reaching Tý', () => {
    // Chỗ này từng sai: trừ thẳng chiIndex − 2 thì Tý và Sửu lệch can, vì chúng đứng sau Hợi
    // trong vòng đếm chứ không đứng trước Dần. Số liệu lấy từ đúng lá số gốc.
    const expected: ReadonlyArray<readonly [number, string]> = [
      [0, 'Mậu Tý'],
      [1, 'Kỷ Sửu'],
      [8, 'Giáp Thân'],
      [9, 'Ất Dậu'],
      [10, 'Bính Tuất'],
      [11, 'Đinh Hợi'],
    ];

    for (const [chi, pillar] of expected) {
      expect(cungCanChi(chi, CANH_TUAT.yearCan)).toBe(pillar);
    }
  });

  it('opens every year stem on the pillar its rhyme names', () => {
    const cases: ReadonlyArray<readonly [number, string]> = [
      [0, 'Bính Dần'], // Giáp
      [1, 'Mậu Dần'], // Ất
      [2, 'Canh Dần'], // Bính
      [3, 'Nhâm Dần'], // Đinh
      [4, 'Giáp Dần'], // Mậu
      [5, 'Bính Dần'], // Kỷ
      [6, 'Mậu Dần'], // Canh
      [7, 'Canh Dần'], // Tân
      [8, 'Nhâm Dần'], // Nhâm
      [9, 'Giáp Dần'], // Quý
    ];

    for (const [yearCan, pillar] of cases) {
      expect(cungCanChi(DAN, yearCan)).toBe(pillar);
    }
  });
});

describe('an cục', () => {
  it('reads the cục off the Mệnh palace, not off the year pillar', () => {
    // Quý Mùi nạp âm là Dương Liễu Mộc, nên Mộc tam cục — dù trụ năm Canh Tuất là Thoa Xuyến Kim.
    expect(anCuc(MUI, CANH_TUAT.yearCan)).toEqual({
      name: 'Mộc Tam Cục',
      element: 'Mộc',
      value: 3,
    });
  });
});

describe('an lai nhân cung', () => {
  /** Chi của lai nhân cung cho cả mười can năm sinh, xếp từ Giáp. */
  const BY_YEAR_CAN: readonly number[] = [
    10, // Giáp → Tuất
    9, // Ất → Dậu
    8, // Bính → Thân
    7, // Đinh → Mùi
    6, // Mậu → Ngọ
    5, // Kỷ → Tị
    4, // Canh → Thìn
    1, // Tân → Sửu
    0, // Nhâm → Tý
    11, // Quý → Hợi
  ];

  it('lands on the palace whose can matches the birth year', () => {
    BY_YEAR_CAN.forEach((chiIndex, yearCan) => {
      expect(anLaiNhanCung(yearCan)).toBe(chiIndex);
    });
  });

  it('takes Tý over Dần and Sửu over Mão when both carry the year can', () => {
    // Ngũ hổ độn rải mười can lên mười hai cung nên tuổi Tân khớp cả Sửu lẫn Mão, tuổi Nhâm khớp cả
    // Tý lẫn Dần. Chỉ hai can này sinh ra trùng; tám can kia luôn ra một cung duy nhất.
    const TAN = 7;
    const NHAM = 8;

    expect(anLaiNhanCung(TAN)).toBe(1);
    expect(anLaiNhanCung(NHAM)).toBe(0);
  });
});
