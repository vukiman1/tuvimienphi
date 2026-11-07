import { TheSinhKhac, theSinhKhac } from '../chi-ngu-hanh.js';
import type { NguHanh } from '../lich/nap-am.js';

export enum MenhVoiNam {
  BinhHoa = 'bình hòa',
  NamSinhMenh = 'năm sinh mệnh',
  MenhSinhNam = 'mệnh sinh năm',
  NamKhacMenh = 'năm khắc mệnh',
  MenhKhacNam = 'mệnh khắc năm',
}

const MENH_VOI_NAM_BY_RELATION: Readonly<Record<TheSinhKhac, MenhVoiNam>> = {
  [TheSinhKhac.TiHoa]: MenhVoiNam.BinhHoa,
  [TheSinhKhac.CungSinhSao]: MenhVoiNam.NamSinhMenh,
  [TheSinhKhac.SaoSinhCung]: MenhVoiNam.MenhSinhNam,
  [TheSinhKhac.CungKhacSao]: MenhVoiNam.NamKhacMenh,
  [TheSinhKhac.SaoKhacCung]: MenhVoiNam.MenhKhacNam,
};

export function menhVoiNam(menh: NguHanh, nam: NguHanh): MenhVoiNam {
  return MENH_VOI_NAM_BY_RELATION[theSinhKhac(menh, nam)];
}
