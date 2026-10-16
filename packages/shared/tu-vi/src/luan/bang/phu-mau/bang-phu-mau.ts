import type { CungLuanBang } from '../cung-luan-bang.js';
import { CHINH_TINH_PHU_MAU } from './chinh-tinh-phu-mau.js';
import { PHU_TINH_PHU_MAU } from './phu-tinh-phu-mau.js';

export const BANG_PHU_MAU = {
  cung: 'Phụ Mẫu',
  chinhTinh: CHINH_TINH_PHU_MAU,
  phuTinh: PHU_TINH_PHU_MAU,
  hoaKy: {
    y: 'phần nâng đỡ từ cha mẹ bị vướng lại, muốn gần nhau thì cũng phải qua trắc trở',
    tuKhoa: ['vướng lại', 'trắc trở'],
  },
  dungCachCuc: false,
} satisfies CungLuanBang;
