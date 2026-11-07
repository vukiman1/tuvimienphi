import { Gender } from '../van-han.js';
import type { BatHan } from './bat-han.js';

export interface BatHanFixtureEntry {
  readonly tuoi: number;
  readonly gender: Gender;
  readonly han: BatHan;
  readonly sources: readonly string[];
}

const DIEN_MAY_XANH_URL =
  'https://www.dienmayxanh.com/kinh-nghiem-hay/sao-chieu-menh-la-gi-bang-sao-han-chi-tiet-1588820';
const QUAN_TRI_MANG_URL = 'https://quantrimang.com/cuoc-song/bang-sao-giai-han-theo-tuoi-169419';
const BOTH_SOURCES: readonly string[] = [DIEN_MAY_XANH_URL, QUAN_TRI_MANG_URL];

export const BAT_HAN_FIXTURE: readonly BatHanFixtureEntry[] = [
  { tuoi: 78, gender: Gender.Nam, han: 'Địa Võng', sources: BOTH_SOURCES },
  { tuoi: 77, gender: Gender.Nam, han: 'Thiên La', sources: BOTH_SOURCES },
  { tuoi: 76, gender: Gender.Nam, han: 'Tán Tận', sources: BOTH_SOURCES },
  { tuoi: 75, gender: Gender.Nam, han: 'Thiên Tinh', sources: BOTH_SOURCES },
  { tuoi: 74, gender: Gender.Nam, han: 'Ngũ Mộ', sources: BOTH_SOURCES },
  { tuoi: 73, gender: Gender.Nam, han: 'Tam Kheo', sources: BOTH_SOURCES },
  { tuoi: 72, gender: Gender.Nam, han: 'Huỳnh Tuyền', sources: BOTH_SOURCES },
  { tuoi: 71, gender: Gender.Nam, han: 'Diêm Vương', sources: BOTH_SOURCES },
  { tuoi: 70, gender: Gender.Nam, han: 'Địa Võng', sources: BOTH_SOURCES },
  { tuoi: 60, gender: Gender.Nam, han: 'Thiên La', sources: BOTH_SOURCES },
  { tuoi: 50, gender: Gender.Nam, han: 'Tán Tận', sources: BOTH_SOURCES },
  { tuoi: 40, gender: Gender.Nam, han: 'Thiên Tinh', sources: BOTH_SOURCES },
  { tuoi: 30, gender: Gender.Nam, han: 'Ngũ Mộ', sources: BOTH_SOURCES },
  { tuoi: 29, gender: Gender.Nam, han: 'Ngũ Mộ', sources: BOTH_SOURCES },
  { tuoi: 28, gender: Gender.Nam, han: 'Tam Kheo', sources: BOTH_SOURCES },
  { tuoi: 27, gender: Gender.Nam, han: 'Huỳnh Tuyền', sources: BOTH_SOURCES },
  { tuoi: 19, gender: Gender.Nam, han: 'Tam Kheo', sources: BOTH_SOURCES },
  { tuoi: 78, gender: Gender.Nu, han: 'Địa Võng', sources: BOTH_SOURCES },
  { tuoi: 77, gender: Gender.Nu, han: 'Diêm Vương', sources: BOTH_SOURCES },
  { tuoi: 76, gender: Gender.Nu, han: 'Huỳnh Tuyền', sources: BOTH_SOURCES },
  { tuoi: 75, gender: Gender.Nu, han: 'Tam Kheo', sources: BOTH_SOURCES },
  { tuoi: 74, gender: Gender.Nu, han: 'Ngũ Mộ', sources: BOTH_SOURCES },
  { tuoi: 73, gender: Gender.Nu, han: 'Thiên Tinh', sources: BOTH_SOURCES },
  { tuoi: 72, gender: Gender.Nu, han: 'Tán Tận', sources: BOTH_SOURCES },
  { tuoi: 71, gender: Gender.Nu, han: 'Thiên La', sources: BOTH_SOURCES },
  { tuoi: 70, gender: Gender.Nu, han: 'Địa Võng', sources: BOTH_SOURCES },
  { tuoi: 60, gender: Gender.Nu, han: 'Diêm Vương', sources: BOTH_SOURCES },
  { tuoi: 50, gender: Gender.Nu, han: 'Huỳnh Tuyền', sources: BOTH_SOURCES },
  { tuoi: 40, gender: Gender.Nu, han: 'Tam Kheo', sources: BOTH_SOURCES },
  { tuoi: 29, gender: Gender.Nu, han: 'Ngũ Mộ', sources: BOTH_SOURCES },
  { tuoi: 28, gender: Gender.Nu, han: 'Thiên Tinh', sources: BOTH_SOURCES },
  { tuoi: 27, gender: Gender.Nu, han: 'Tán Tận', sources: BOTH_SOURCES },
  { tuoi: 19, gender: Gender.Nu, han: 'Thiên Tinh', sources: BOTH_SOURCES },
];
