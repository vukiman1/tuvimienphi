import { anLuuDaiVanTinh } from './an-luu-dai-van';
import { castChart } from './cast-chart';
import type { SaoName } from './sao-names';
import { Gender } from './van-han';

/**
 * Cào từ hai mươi tám lá số tuvi.vn: mỗi lá số cho một cặp (can, chi) của cung đại vận, gộp lại
 * được hai mươi hai cặp phủ đủ mười can và mười một trong mười hai chi.
 *
 * Bảng dưới chỉ ghi theo trụ chứ không theo lá số, vì tám sao này không phụ thuộc lá số gốc — nhiều
 * lá số khác hẳn nhau rơi vào cùng một trụ đều cho đúng bộ vị trí này.
 */
const TUVI_VN: ReadonlyArray<{
  readonly tru: string;
  readonly canChi: { readonly can: number; readonly chi: number };
  readonly stars: Readonly<Record<string, number>>;
}> = [
  {
    tru: 'Giáp Thìn',
    canChi: { can: 0, chi: 4 },
    stars: {
      'Đà La': 1,
      'Thiên Khôi': 1,
      'Lộc Tồn': 2,
      'Thiên Mã': 2,
      'Kình Dương': 3,
      'Văn Xương': 5,
      'Thiên Việt': 7,
      'Văn Khúc': 9,
    },
  },
  {
    tru: 'Giáp Tuất',
    canChi: { can: 0, chi: 10 },
    stars: {
      'Đà La': 1,
      'Thiên Khôi': 1,
      'Lộc Tồn': 2,
      'Kình Dương': 3,
      'Văn Xương': 5,
      'Thiên Việt': 7,
      'Thiên Mã': 8,
      'Văn Khúc': 9,
    },
  },
  {
    tru: 'Ất Mùi',
    canChi: { can: 1, chi: 7 },
    stars: {
      'Thiên Khôi': 0,
      'Đà La': 2,
      'Lộc Tồn': 3,
      'Kình Dương': 4,
      'Thiên Mã': 5,
      'Văn Xương': 6,
      'Thiên Việt': 8,
      'Văn Khúc': 8,
    },
  },
  {
    tru: 'Ất Hợi',
    canChi: { can: 1, chi: 11 },
    stars: {
      'Thiên Khôi': 0,
      'Đà La': 2,
      'Lộc Tồn': 3,
      'Kình Dương': 4,
      'Thiên Mã': 5,
      'Văn Xương': 6,
      'Thiên Việt': 8,
      'Văn Khúc': 8,
    },
  },
  {
    tru: 'Bính Thìn',
    canChi: { can: 2, chi: 4 },
    stars: {
      'Thiên Mã': 2,
      'Đà La': 4,
      'Lộc Tồn': 5,
      'Kình Dương': 6,
      'Văn Khúc': 6,
      'Văn Xương': 8,
      'Thiên Việt': 9,
      'Thiên Khôi': 11,
    },
  },
  {
    tru: 'Đinh Dậu',
    canChi: { can: 3, chi: 9 },
    stars: {
      'Đà La': 5,
      'Lộc Tồn': 6,
      'Kình Dương': 7,
      'Thiên Việt': 9,
      'Thiên Khôi': 11,
      'Thiên Mã': 11,
    },
  },
  {
    tru: 'Đinh Hợi',
    canChi: { can: 3, chi: 11 },
    stars: {
      'Đà La': 5,
      'Thiên Mã': 5,
      'Lộc Tồn': 6,
      'Kình Dương': 7,
      'Thiên Việt': 9,
      'Thiên Khôi': 11,
    },
  },
  {
    tru: 'Mậu Dần',
    canChi: { can: 4, chi: 2 },
    stars: {
      'Thiên Khôi': 1,
      'Đà La': 4,
      'Lộc Tồn': 5,
      'Kình Dương': 6,
      'Thiên Việt': 7,
      'Thiên Mã': 8,
    },
  },
  {
    tru: 'Mậu Ngọ',
    canChi: { can: 4, chi: 6 },
    stars: {
      'Thiên Khôi': 1,
      'Đà La': 4,
      'Lộc Tồn': 5,
      'Kình Dương': 6,
      'Thiên Việt': 7,
      'Thiên Mã': 8,
    },
  },
  {
    tru: 'Mậu Thân',
    canChi: { can: 4, chi: 8 },
    stars: {
      'Thiên Khôi': 1,
      'Thiên Mã': 2,
      'Đà La': 4,
      'Lộc Tồn': 5,
      'Kình Dương': 6,
      'Thiên Việt': 7,
    },
  },
  {
    tru: 'Mậu Tuất',
    canChi: { can: 4, chi: 10 },
    stars: {
      'Thiên Khôi': 1,
      'Đà La': 4,
      'Lộc Tồn': 5,
      'Kình Dương': 6,
      'Thiên Việt': 7,
      'Thiên Mã': 8,
    },
  },
  {
    tru: 'Kỷ Sửu',
    canChi: { can: 5, chi: 1 },
    stars: {
      'Thiên Khôi': 0,
      'Đà La': 5,
      'Văn Khúc': 5,
      'Lộc Tồn': 6,
      'Kình Dương': 7,
      'Thiên Việt': 8,
      'Văn Xương': 9,
      'Thiên Mã': 11,
    },
  },
  {
    tru: 'Kỷ Dậu',
    canChi: { can: 5, chi: 9 },
    stars: {
      'Thiên Khôi': 0,
      'Đà La': 5,
      'Văn Khúc': 5,
      'Lộc Tồn': 6,
      'Kình Dương': 7,
      'Thiên Việt': 8,
      'Văn Xương': 9,
      'Thiên Mã': 11,
    },
  },
  {
    tru: 'Canh Tý',
    canChi: { can: 6, chi: 0 },
    stars: {
      'Thiên Mã': 2,
      'Thiên Việt': 2,
      'Thiên Khôi': 6,
      'Đà La': 7,
      'Lộc Tồn': 8,
      'Kình Dương': 9,
      'Văn Khúc': 11,
      'Văn Xương': 11,
    },
  },
  {
    tru: 'Canh Thìn',
    canChi: { can: 6, chi: 4 },
    stars: {
      'Thiên Mã': 2,
      'Thiên Việt': 2,
      'Thiên Khôi': 6,
      'Đà La': 7,
      'Lộc Tồn': 8,
      'Kình Dương': 9,
      'Văn Khúc': 11,
      'Văn Xương': 11,
    },
  },
  {
    tru: 'Canh Thân',
    canChi: { can: 6, chi: 8 },
    stars: {
      'Thiên Mã': 2,
      'Thiên Việt': 2,
      'Thiên Khôi': 6,
      'Đà La': 7,
      'Lộc Tồn': 8,
      'Kình Dương': 9,
      'Văn Khúc': 11,
      'Văn Xương': 11,
    },
  },
  {
    tru: 'Tân Tị',
    canChi: { can: 7, chi: 5 },
    stars: {
      'Văn Xương': 0,
      'Thiên Việt': 2,
      'Văn Khúc': 2,
      'Thiên Khôi': 6,
      'Đà La': 8,
      'Lộc Tồn': 9,
      'Kình Dương': 10,
      'Thiên Mã': 11,
    },
  },
  {
    tru: 'Tân Mùi',
    canChi: { can: 7, chi: 7 },
    stars: {
      'Văn Xương': 0,
      'Thiên Việt': 2,
      'Văn Khúc': 2,
      'Thiên Mã': 5,
      'Thiên Khôi': 6,
      'Đà La': 8,
      'Lộc Tồn': 9,
      'Kình Dương': 10,
    },
  },
  {
    tru: 'Tân Dậu',
    canChi: { can: 7, chi: 9 },
    stars: {
      'Văn Xương': 0,
      'Thiên Việt': 2,
      'Văn Khúc': 2,
      'Thiên Khôi': 6,
      'Đà La': 8,
      'Lộc Tồn': 9,
      'Kình Dương': 10,
      'Thiên Mã': 11,
    },
  },
  {
    tru: 'Nhâm Tý',
    canChi: { can: 8, chi: 0 },
    stars: {
      'Kình Dương': 0,
      'Văn Khúc': 0,
      'Thiên Mã': 2,
      'Văn Xương': 2,
      'Thiên Khôi': 3,
      'Thiên Việt': 5,
      'Đà La': 10,
      'Lộc Tồn': 11,
    },
  },
  {
    tru: 'Nhâm Ngọ',
    canChi: { can: 8, chi: 6 },
    stars: {
      'Kình Dương': 0,
      'Văn Khúc': 0,
      'Văn Xương': 2,
      'Thiên Khôi': 3,
      'Thiên Việt': 5,
      'Thiên Mã': 8,
      'Đà La': 10,
      'Lộc Tồn': 11,
    },
  },
  {
    tru: 'Quý Mùi',
    canChi: { can: 9, chi: 7 },
    stars: {
      'Lộc Tồn': 0,
      'Kình Dương': 1,
      'Thiên Khôi': 3,
      'Văn Xương': 3,
      'Thiên Mã': 5,
      'Thiên Việt': 5,
      'Đà La': 11,
      'Văn Khúc': 11,
    },
  },
];

/** Bốn hoá cần vị trí natal của sao nhận hoá; bảng trên chỉ kiểm tám sao còn lại. */
const NO_STAR_PLACES: ReadonlyMap<SaoName, number> = new Map();

describe('anLuuDaiVanTinh — tám sao an theo trụ cung đại vận', () => {
  it.each(TUVI_VN)('an đúng tám sao ở trụ $tru', ({ canChi, stars }) => {
    const placed = anLuuDaiVanTinh(canChi, NO_STAR_PLACES);
    expect(Object.fromEntries(placed.map((sao) => [sao.name, sao.chiIndex]))).toEqual(stars);
  });

  it('bỏ trống Văn Xương và Văn Khúc ở can Đinh và can Mậu', () => {
    const CAN_DINH = 3;
    const CAN_MAU = 4;
    for (const can of [CAN_DINH, CAN_MAU]) {
      const names = anLuuDaiVanTinh({ can, chi: 0 }, NO_STAR_PLACES).map((sao) => sao.name);
      expect(names).not.toContain('Văn Xương');
      expect(names).not.toContain('Văn Khúc');
    }
  });

  it('đưa Văn Khúc về Hợi ở can Canh, khác tầng lưu niên vốn để ở Mão', () => {
    const CAN_CANH = 6;
    const HOI = 11;
    const placed = anLuuDaiVanTinh({ can: CAN_CANH, chi: 0 }, NO_STAR_PLACES);
    expect(placed.find((sao) => sao.name === 'Văn Khúc')?.chiIndex).toBe(HOI);
  });
});

describe('anLuuDaiVanTinh — bốn hoá đóng tại cung của sao nhận hoá', () => {
  it('cho can Ất, bốn hoá theo Thiên Cơ, Thiên Lương, Tử Vi và Thái Âm', () => {
    const CAN_AT = 1;
    const places = new Map<SaoName, number>([
      ['Thiên Cơ', 8],
      ['Thiên Lương', 0],
      ['Tử Vi', 9],
      ['Thái Âm', 8],
    ]);
    const placed = anLuuDaiVanTinh({ can: CAN_AT, chi: 7 }, places);
    const at = (name: string) => placed.find((sao) => sao.name === name)?.chiIndex;
    expect([at('Hóa Lộc'), at('Hóa Quyền'), at('Hóa Khoa'), at('Hóa Kỵ')]).toEqual([8, 0, 9, 8]);
  });

  it('cho can Nhâm, hoá Khoa theo Thiên Phủ chứ không theo Tả Phù', () => {
    const CAN_NHAM = 8;
    const THIEN_PHU_AT = 2;
    const TA_PHU_AT = 8;
    const places = new Map<SaoName, number>([
      ['Thiên Phủ', THIEN_PHU_AT],
      ['Tả Phù', TA_PHU_AT],
    ]);
    const placed = anLuuDaiVanTinh({ can: CAN_NHAM, chi: 0 }, places);
    expect(placed.find((sao) => sao.name === 'Hóa Khoa')?.chiIndex).toBe(THIEN_PHU_AT);
  });
});

/**
 * Lá số 1/2/2002 giờ Tị nam, xem năm 2023 — đại vận đang ở cung Mùi mang can Ất. Đối chiếu trọn cả
 * mười hai sao như trang gốc in ra, để chắc phần nối vào `applyViewYear` cũng đúng.
 */
describe('castChart — tầng ĐV.* của một lá số thật', () => {
  const chart = castChart({
    solarDate: new Date(2002, 1, 1),
    hour: 9,
    gender: Gender.Nam,
    viewYear: 2023,
  });
  const placed = Object.fromEntries(
    chart.cungs.flatMap((cung) => cung.daiVanTinh.map((name) => [name, cung.chiIndex])),
  );

  it('an đủ mười hai sao đúng như tuvi.vn', () => {
    expect(placed).toEqual({
      'Thiên Khôi': 0,
      'Hóa Quyền': 0,
      'Đà La': 2,
      'Lộc Tồn': 3,
      'Kình Dương': 4,
      'Thiên Mã': 5,
      'Văn Xương': 6,
      'Thiên Việt': 8,
      'Văn Khúc': 8,
      'Hóa Lộc': 8,
      'Hóa Kỵ': 8,
      'Hóa Khoa': 9,
    });
  });

  it('không an sao nào khi không truyền năm xem', () => {
    const natal = castChart({ solarDate: new Date(2002, 1, 1), hour: 9, gender: Gender.Nam });
    expect(natal.cungs.every((cung) => cung.daiVanTinh.length === 0)).toBe(true);
  });
});
