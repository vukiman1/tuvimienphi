export enum GiaiDoanTuoi {
  LapNghiep = 'lập nghiệp',
  XayDung = 'xây dựng',
  TrungNien = 'trung niên',
  VeHuu = 'về hưu',
  TuoiGia = 'tuổi già',
}

interface GiaiDoanBand {
  readonly maxTuoi: number;
  readonly giaiDoan: GiaiDoanTuoi;
}

const GIAI_DOAN_BANDS: readonly GiaiDoanBand[] = [
  { maxTuoi: 30, giaiDoan: GiaiDoanTuoi.LapNghiep },
  { maxTuoi: 45, giaiDoan: GiaiDoanTuoi.XayDung },
  { maxTuoi: 60, giaiDoan: GiaiDoanTuoi.TrungNien },
  { maxTuoi: 75, giaiDoan: GiaiDoanTuoi.VeHuu },
];

export function giaiDoanTuoi(tuoi: number): GiaiDoanTuoi {
  const band = GIAI_DOAN_BANDS.find(({ maxTuoi }) => tuoi <= maxTuoi);
  return band?.giaiDoan ?? GiaiDoanTuoi.TuoiGia;
}
