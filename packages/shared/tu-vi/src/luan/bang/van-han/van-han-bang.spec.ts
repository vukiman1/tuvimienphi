import { anLuuTinh } from '../../../an-luu-tinh.js';
import { CUU_DIEU } from '../../../dan-gian.js';
import { CUNG_NAMES } from '../../../dia-ban.js';
import { HOA_NAMES } from '../../../tu-hoa.js';
import { Sac, type LuanDe } from '../../luan-de.js';
import { CUU_DIEU_LOI, KIM_LAU_LOI, TAM_TAI_LOI } from './dan-gian-loi.js';
import { DAI_VAN_CHU_DE } from './dai-van-chu-de.js';
import { HOA_VAN_HAN_LUAN } from './hoa-van-han-luan.js';
import { LINH_VUC } from './linh-vuc.js';
import { LUU_TINH_LUAN } from './luu-tinh-luan.js';

const CAN_COUNT = 10;
const CHI_COUNT = 12;
const MIN_LUU_TINH_TRONG = 40;
const MAX_LUU_TINH_TRONG = 70;
const MAX_CHU_DE_NAM_WORDS = 6;

const FEAR_WORDS = [
  'tai nạn',
  'bệnh nặng',
  'qua đời',
  'tử vong',
  'mất mạng',
  'kiện tụng',
  'phá sản',
  'tai hoạ',
  'tai họa',
];

const NGHICH_STARS = [
  'Tang Môn',
  'Bạch Hổ',
  'Kiếp Sát',
  'Thiên Khốc',
  'Thiên Hư',
  'Kình Dương',
  'Thái Tuế',
  'Hóa Kỵ',
];

const THUAN_STARS = [
  'Lộc Tồn',
  'Thiên Khôi',
  'Thiên Việt',
  'Văn Xương',
  'Văn Khúc',
  'Nguyệt Đức',
  'Thiên Đức',
  'Hóa Lộc',
  'Hóa Quyền',
  'Hóa Khoa',
];

const CLAIMS: ReadonlyArray<readonly [string, LuanDe]> = [
  ...Object.entries(LUU_TINH_LUAN),
  ...Object.entries(HOA_VAN_HAN_LUAN),
];

function emittedLuuTinhNames(): string[] {
  const names = new Set<string>();
  for (let can = 0; can < CAN_COUNT; can++) {
    for (let chi = 0; chi < CHI_COUNT; chi++) {
      anLuuTinh({ can, chi }).forEach((placement) => names.add(placement.name));
    }
  }
  return [...names].sort();
}

function allTexts(): string[] {
  return [
    ...CLAIMS.map(([, claim]) => claim.y),
    ...Object.values(DAI_VAN_CHU_DE),
    ...Object.values(LINH_VUC).flatMap((entry) => [
      entry.linhVuc,
      entry.chuDeNam,
      entry.loiKhuyen,
      entry.nhinLai,
    ]),
    ...Object.values(CUU_DIEU_LOI),
    TAM_TAI_LOI,
    KIM_LAU_LOI,
  ];
}

describe('vận hạn tables', () => {
  it('reads every lưu tinh the engine can place', () => {
    expect(Object.keys(LUU_TINH_LUAN).sort()).toEqual(emittedLuuTinhNames());
  });

  it('reads all four hoá', () => {
    expect(Object.keys(HOA_VAN_HAN_LUAN).sort()).toEqual([...HOA_NAMES].sort());
  });

  it('gives a theme and a life area to every natal cung a decade or a year can sit in', () => {
    expect(Object.keys(DAI_VAN_CHU_DE).sort()).toEqual([...CUNG_NAMES].sort());
    expect(Object.keys(LINH_VUC).sort()).toEqual([...CUNG_NAMES].sort());
  });

  it('has a folk line for each of the nine Cửu Diệu stars', () => {
    expect(Object.keys(CUU_DIEU_LOI).sort()).toEqual([...CUU_DIEU].sort());
  });

  it('attributes each claim to the star it is keyed on', () => {
    for (const [star, claim] of CLAIMS) {
      expect([star, claim.do]).toEqual([star, [star]]);
    }
  });

  it('keeps every keyword verbatim inside its own claim', () => {
    for (const [star, claim] of CLAIMS) {
      for (const keyword of claim.tuKhoa) {
        expect([star, keyword, claim.y.includes(keyword)]).toEqual([star, keyword, true]);
      }
    }
  });

  it('reads the hung lưu tinh and Hóa Kỵ against the year', () => {
    const claims = new Map(CLAIMS);
    for (const star of NGHICH_STARS) {
      expect([star, claims.get(star)?.sac]).toEqual([star, Sac.Nghich]);
    }
  });

  it('reads the cát lưu tinh and the other three hoá in favour of the year', () => {
    const claims = new Map(CLAIMS);
    for (const star of THUAN_STARS) {
      expect([star, claims.get(star)?.sac]).toEqual([star, Sac.Thuan]);
    }
  });

  it('only reads a claim for or against the year, never as a mitigation', () => {
    for (const [star, claim] of CLAIMS) {
      expect([star, [Sac.Thuan, Sac.Nghich].includes(claim.sac)]).toEqual([star, true]);
    }
  });

  it('weighs lưu tinh in the same band as the natal phụ tinh', () => {
    for (const [star, claim] of Object.entries(LUU_TINH_LUAN)) {
      const isInBand = claim.trong >= MIN_LUU_TINH_TRONG && claim.trong <= MAX_LUU_TINH_TRONG;
      expect([star, isInBand]).toEqual([star, true]);
    }
  });

  it('keeps the theme of the year short enough to share', () => {
    for (const [cung, entry] of Object.entries(LINH_VUC)) {
      const wordCount = entry.chuDeNam.split(/\s+/).length;
      expect([cung, wordCount <= MAX_CHU_DE_NAM_WORDS]).toEqual([cung, true]);
    }
  });

  it('never predicts harm in any table', () => {
    for (const text of allTexts()) {
      const lowered = text.toLowerCase();
      for (const word of FEAR_WORDS) {
        expect([text, word, lowered.includes(word)]).toEqual([text, word, false]);
      }
    }
  });

  it('links each life area to the chapter that reads its cung', () => {
    expect(LINH_VUC['Mệnh'].chuongLienQuan).toBe('02');
    expect(LINH_VUC['Quan Lộc'].chuongLienQuan).toBe('03');
    expect(LINH_VUC['Tài Bạch'].chuongLienQuan).toBe('04');
    expect(LINH_VUC['Phu Thê'].chuongLienQuan).toBe('05');
  });
});
