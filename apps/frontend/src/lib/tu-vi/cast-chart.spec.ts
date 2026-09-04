import { CAN, CHI } from '@/lib/lunar-calendar';
import { applyViewYear, castChart, castNatal } from './cast-chart';
import { Gender } from './van-han';

/**
 * Đối chiếu đầu-cuối với một lá số thật trên tuvi.vn: sinh 1/1/1911 dương, tức 2 tháng 12 năm Canh
 * Tuất, giờ Ngọ, nam. Đây cũng là lá số giao diện đang dùng làm dữ liệu mẫu.
 *
 * Vào bằng ngày dương chứ không truyền sẵn ngày âm — như vậy phép đổi lịch cũng nằm trong phạm vi
 * kiểm tra, chứ không chỉ mỗi phần an sao.
 */
const chart = castChart({
  solarDate: new Date(1911, 0, 1),
  hour: 12, // giờ Ngọ
  gender: Gender.Nam,
});

const pillar = (value: { can: number; chi: number }) => `${CAN[value.can]} ${CHI[value.chi]}`;

describe('castChart — lá số Canh Tuất 1910', () => {
  it('derives all four pillars from the solar date alone', () => {
    expect(pillar(chart.pillars.year)).toBe('Canh Tuất');
    expect(pillar(chart.pillars.month)).toBe('Kỷ Sửu');
    expect(pillar(chart.pillars.day)).toBe('Tân Mùi');
    expect(pillar(chart.pillars.hour)).toBe('Giáp Ngọ');
  });

  it('reads bản mệnh off the year pillar and cục off the Mệnh palace', () => {
    expect(chart.banMenh).toBe('Thoa Xuyến Kim');
    expect(chart.cuc.name).toBe('Mộc Tam Cục');
  });

  it('puts Thân on Mệnh at Mùi', () => {
    const MUI = 7;
    expect(chart.menhIndex).toBe(MUI);
    expect(chart.thanIndex).toBe(MUI);
    expect(chart.amDuong.label).toBe('Dương Nam');
  });

  it('blocks Dần – Mão with Tuần and Ngọ – Mùi with Triệt', () => {
    expect(chart.tuan).toEqual([2, 3]);
    expect(chart.triet).toEqual([6, 7]);
  });

  it('names every palace as the original chart does', () => {
    const expected = [
      'Nô Bộc',
      'Thiên Di',
      'Tật Ách',
      'Tài Bạch',
      'Tử Tức',
      'Phu Thê',
      'Huynh Đệ',
      'Mệnh',
      'Phụ Mẫu',
      'Phúc Đức',
      'Điền Trạch',
      'Quan Lộc',
    ];
    expect(chart.cungs.map((cung) => cung.name)).toEqual(expected);
  });

  it('places the fourteen major stars palace by palace', () => {
    const expected: Readonly<Record<number, readonly string[]>> = {
      0: ['Thiên Cơ'],
      1: ['Tử Vi', 'Phá Quân'],
      2: [],
      3: ['Thiên Phủ'],
      4: ['Thái Âm'],
      5: ['Liêm Trinh', 'Tham Lang'],
      6: ['Cự Môn'],
      7: ['Thiên Tướng'],
      8: ['Thiên Đồng', 'Thiên Lương'],
      9: ['Vũ Khúc', 'Thất Sát'],
      10: ['Thái Dương'],
      11: [],
    };

    for (const cung of chart.cungs) {
      expect([cung.chiIndex, cung.chinhTinh.map((star) => star.name).sort()]).toEqual([
        cung.chiIndex,
        [...expected[cung.chiIndex]].sort(),
      ]);
    }
  });

  it('runs đại vận from 3 at Mệnh through to 113', () => {
    expect(chart.daiVan[0]).toEqual({ chiIndex: 7, startAge: 3, endAge: 12 });
    expect(chart.daiVan[11]).toEqual({ chiIndex: 6, startAge: 113, endAge: 122 });
  });

  it('gives the Canh year its four transformations', () => {
    expect(chart.tuHoa.map((entry) => entry.star)).toEqual([
      'Thái Dương',
      'Vũ Khúc',
      'Thái Âm',
      'Thiên Đồng',
    ]);
  });
});

/**
 * Ngày 13/6/1975 Việt Nam đổi từ UTC+8 sang UTC+7, nên 12/6 dài hai mươi lăm tiếng. Cộng đúng
 * 86.400.000 ms vào 12/6 vẫn rơi lại 12/6, và giờ Tý sớm hôm đó lấy nhầm ngày âm.
 */
describe('castChart quanh mốc đổi múi giờ', () => {
  const originalTimeZone = process.env.TZ;

  beforeAll(() => {
    process.env.TZ = 'Asia/Ho_Chi_Minh';
  });

  afterAll(() => {
    process.env.TZ = originalTimeZone;
  });

  it('moves giờ Tý sớm onto the next day even when that day runs twenty-five hours', () => {
    const tySom = castChart({ solarDate: new Date(1975, 5, 12), hour: 23, gender: Gender.Nam });
    const homSau = castChart({ solarDate: new Date(1975, 5, 13), hour: 0, gender: Gender.Nam });

    expect(tySom.lunar).toEqual(homSau.lunar);
  });
});

describe('castNatal và applyViewYear', () => {
  const BIRTH = { solarDate: new Date(1911, 0, 1), hour: 12, gender: Gender.Nam };

  it('gives the same chart as casting fresh at that view year', () => {
    const natal = castNatal(BIRTH);

    expect(applyViewYear(natal, 2026)).toEqual(castChart({ ...BIRTH, viewYear: 2026 }));
    expect(applyViewYear(natal, 2023)).toEqual(castChart({ ...BIRTH, viewYear: 2023 }));
  });

  it('leaves the natal layers untouched when only the view year changes', () => {
    const natal = castNatal(BIRTH);
    const at2023 = applyViewYear(natal, 2023);
    const at2026 = applyViewYear(natal, 2026);

    const starsOf = (chart: typeof at2023) => chart.cungs.map((cung) => cung.chinhTinh);
    const monthsOf = (chart: typeof at2023) => chart.cungs.map((cung) => cung.cungThang);

    expect(starsOf(at2023)).toEqual(starsOf(at2026));
    // Nhãn `ĐV.*` đứng yên suốt mười năm một vận, nên so tiểu hạn và cung tháng — hai tầng đổi
    // theo từng năm.
    expect(at2023.tieuHan).not.toBe(at2026.tieuHan);
    expect(monthsOf(at2023)).not.toEqual(monthsOf(at2026));
  });
});
