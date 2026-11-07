import { HoangOc } from './hoang-oc.js';

export interface HoangOcFixtureEntry {
  readonly tuoi: number;
  readonly cung: HoangOc;
  readonly source: string;
}

const DIEN_MAY_XANH_URL =
  'https://www.dienmayxanh.com/kinh-nghiem-hay/hoang-oc-la-gi-cach-tinh-tuoi-hoang-oc-1586912';
const BAT_DONG_SAN_URL = 'https://wiki.batdongsan.com.vn/wiki/hoang-oc-la-gi-110059';

export const HOANG_OC_FIXTURE: readonly HoangOcFixtureEntry[] = [
  { tuoi: 18, cung: HoangOc.TamDiaSat, source: BAT_DONG_SAN_URL },
  { tuoi: 20, cung: HoangOc.NhiNghi, source: DIEN_MAY_XANH_URL },
  { tuoi: 25, cung: HoangOc.NhatCat, source: BAT_DONG_SAN_URL },
  { tuoi: 33, cung: HoangOc.LucHoangOc, source: DIEN_MAY_XANH_URL },
  { tuoi: 33, cung: HoangOc.LucHoangOc, source: BAT_DONG_SAN_URL },
  { tuoi: 42, cung: HoangOc.LucHoangOc, source: BAT_DONG_SAN_URL },
  { tuoi: 47, cung: HoangOc.NguThoTu, source: BAT_DONG_SAN_URL },
  { tuoi: 50, cung: HoangOc.NguThoTu, source: BAT_DONG_SAN_URL },
  { tuoi: 56, cung: HoangOc.NguThoTu, source: BAT_DONG_SAN_URL },
  { tuoi: 61, cung: HoangOc.NhatCat, source: BAT_DONG_SAN_URL },
  { tuoi: 64, cung: HoangOc.TuTanTai, source: DIEN_MAY_XANH_URL },
  { tuoi: 70, cung: HoangOc.NhatCat, source: BAT_DONG_SAN_URL },
  { tuoi: 73, cung: HoangOc.TuTanTai, source: BAT_DONG_SAN_URL },
  { tuoi: 78, cung: HoangOc.TamDiaSat, source: BAT_DONG_SAN_URL },
];
