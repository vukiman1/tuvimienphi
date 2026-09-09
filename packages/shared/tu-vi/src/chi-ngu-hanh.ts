import type { NguHanh } from './lich/nap-am.js';

/** Ngũ hành của mười hai địa chi, xếp theo chỉ số chi 0 = Tý. */
export const CHI_NGU_HANH: readonly NguHanh[] = [
  'Thủy',
  'Thổ',
  'Mộc',
  'Mộc',
  'Thổ',
  'Hỏa',
  'Hỏa',
  'Thổ',
  'Kim',
  'Kim',
  'Thổ',
  'Thủy',
];

/** Vòng tương sinh: Mộc sinh Hỏa sinh Thổ sinh Kim sinh Thủy rồi lại sinh Mộc. */
const SINH: Readonly<Record<NguHanh, NguHanh>> = {
  Mộc: 'Hỏa',
  Hỏa: 'Thổ',
  Thổ: 'Kim',
  Kim: 'Thủy',
  Thủy: 'Mộc',
};

/** Vòng tương khắc: Mộc khắc Thổ khắc Thủy khắc Hỏa khắc Kim rồi lại khắc Mộc. */
const KHAC: Readonly<Record<NguHanh, NguHanh>> = {
  Mộc: 'Thổ',
  Thổ: 'Thủy',
  Thủy: 'Hỏa',
  Hỏa: 'Kim',
  Kim: 'Mộc',
};

export enum TheSinhKhac {
  TiHoa = 'tị hoà',
  SaoSinhCung = 'sao sinh cung',
  CungSinhSao = 'cung sinh sao',
  SaoKhacCung = 'sao khắc cung',
  CungKhacSao = 'cung khắc sao',
}

export function theSinhKhac(hanhSao: NguHanh, hanhCung: NguHanh): TheSinhKhac {
  if (hanhSao === hanhCung) return TheSinhKhac.TiHoa;
  if (SINH[hanhSao] === hanhCung) return TheSinhKhac.SaoSinhCung;
  if (SINH[hanhCung] === hanhSao) return TheSinhKhac.CungSinhSao;
  if (KHAC[hanhSao] === hanhCung) return TheSinhKhac.SaoKhacCung;
  return TheSinhKhac.CungKhacSao;
}
