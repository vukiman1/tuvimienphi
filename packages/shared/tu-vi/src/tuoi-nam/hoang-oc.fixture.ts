import { HoangOc } from './hoang-oc.js';

export interface HoangOcFixtureEntry {
  readonly tuoi: number;
  readonly cung: HoangOc;
  readonly sources: readonly string[];
}

const DIEN_MAY_XANH_URL =
  'https://www.dienmayxanh.com/kinh-nghiem-hay/hoang-oc-la-gi-cach-tinh-tuoi-hoang-oc-1586912';
const BAT_DONG_SAN_URL = 'https://wiki.batdongsan.com.vn/wiki/hoang-oc-la-gi-110059';

export const HOANG_OC_FIXTURE: readonly HoangOcFixtureEntry[] = [
  { tuoi: 20, cung: HoangOc.NhiNghi, sources: [DIEN_MAY_XANH_URL, BAT_DONG_SAN_URL] },
  { tuoi: 22, cung: HoangOc.TuTanTai, sources: [BAT_DONG_SAN_URL] },
  { tuoi: 25, cung: HoangOc.NhatCat, sources: [BAT_DONG_SAN_URL] },
  { tuoi: 33, cung: HoangOc.LucHoangOc, sources: [DIEN_MAY_XANH_URL, BAT_DONG_SAN_URL] },
  { tuoi: 42, cung: HoangOc.LucHoangOc, sources: [BAT_DONG_SAN_URL] },
  { tuoi: 47, cung: HoangOc.NguThoTu, sources: [BAT_DONG_SAN_URL] },
  { tuoi: 50, cung: HoangOc.NguThoTu, sources: [BAT_DONG_SAN_URL] },
  { tuoi: 56, cung: HoangOc.NguThoTu, sources: [BAT_DONG_SAN_URL] },
  { tuoi: 63, cung: HoangOc.TamDiaSat, sources: [BAT_DONG_SAN_URL] },
  { tuoi: 69, cung: HoangOc.TamDiaSat, sources: [BAT_DONG_SAN_URL] },
  { tuoi: 70, cung: HoangOc.NhatCat, sources: [BAT_DONG_SAN_URL] },
  { tuoi: 80, cung: HoangOc.NhiNghi, sources: [BAT_DONG_SAN_URL] },
];
