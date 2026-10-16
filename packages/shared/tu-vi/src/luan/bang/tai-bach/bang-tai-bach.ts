import type { CungLuanBang } from '../cung-luan-bang.js';
import { CHINH_TINH_TAI_BACH } from './chinh-tinh-tai-bach.js';
import { PHU_TINH_TAI_BACH } from './phu-tinh-tai-bach.js';

export const BANG_TAI_BACH = {
  cung: 'Tài Bạch',
  chinhTinh: CHINH_TINH_TAI_BACH,
  phuTinh: PHU_TINH_TAI_BACH,
  hoaKy: {
    y: 'phần thuận lợi bị vướng lại, muốn được việc thì cũng phải qua trắc trở',
    tuKhoa: ['vướng lại', 'trắc trở'],
  },
  dungCachCuc: true,
} satisfies CungLuanBang;
