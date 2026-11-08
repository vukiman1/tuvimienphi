export enum HoangOc {
  NhatCat = 'Nhất Cát',
  NhiNghi = 'Nhì Nghi',
  TamDiaSat = 'Tam Địa Sát',
  TuTanTai = 'Tứ Tấn Tài',
  NguThoTu = 'Ngũ Thọ Tử',
  LucHoangOc = 'Lục Hoang Ốc',
}

const HOANG_OC_CYCLE: readonly HoangOc[] = [
  HoangOc.NhatCat,
  HoangOc.NhiNghi,
  HoangOc.TamDiaSat,
  HoangOc.TuTanTai,
  HoangOc.NguThoTu,
  HoangOc.LucHoangOc,
];
const HOANG_OC_TOT: readonly HoangOc[] = [HoangOc.NhatCat, HoangOc.NhiNghi, HoangOc.TuTanTai];
const YEARS_PER_DECADE = 10;

export const HOANG_OC_TRUYEN_THONG =
  'Theo cách đếm phổ biến, tuổi mụ 10 rơi vào Nhất Cát, mỗi chục tuổi sau đó tiến thêm một cung, rồi đếm tiếp từng tuổi lẻ theo vòng sáu cung Nhất Cát, Nhì Nghi, Tam Địa Sát, Tứ Tấn Tài, Ngũ Thọ Tử, Lục Hoang Ốc.';

export function hoangOc(tuoi: number): HoangOc {
  const decade = Math.floor(tuoi / YEARS_PER_DECADE);
  const units = tuoi % YEARS_PER_DECADE;
  return HOANG_OC_CYCLE[(decade - 1 + units) % HOANG_OC_CYCLE.length];
}

export function isHoangOcTot(cung: HoangOc): boolean {
  return HOANG_OC_TOT.includes(cung);
}
