import type { CungLuanBang } from '../cung-luan-bang.js';
import { CHINH_TINH_HUYNH_DE } from './chinh-tinh-huynh-de.js';
import { PHU_TINH_HUYNH_DE } from './phu-tinh-huynh-de.js';

export const BANG_HUYNH_DE = {
  cung: 'Huynh Đệ',
  chinhTinh: CHINH_TINH_HUYNH_DE,
  phuTinh: PHU_TINH_HUYNH_DE,
  hoaKy: {
    y: 'tình anh em bị vướng lại, muốn gần nhau thì cũng phải qua trắc trở',
    tuKhoa: ['vướng lại', 'trắc trở'],
  },
  dungCachCuc: false,
} satisfies CungLuanBang;
