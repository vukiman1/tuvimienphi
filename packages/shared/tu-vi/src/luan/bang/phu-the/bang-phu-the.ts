import type { CungLuanBang } from '../cung-luan-bang.js';
import { CHINH_TINH_PHU_THE } from './chinh-tinh-phu-the.js';
import { PHU_TINH_PHU_THE } from './phu-tinh-phu-the.js';

export const BANG_PHU_THE = {
  cung: 'Phu Thê',
  chinhTinh: CHINH_TINH_PHU_THE,
  phuTinh: PHU_TINH_PHU_THE,
  hoaKy: {
    y: 'phần êm ấm giữa hai người bị vướng lại, muốn gắn bó thì cũng phải qua trắc trở',
    tuKhoa: ['vướng lại', 'trắc trở'],
  },
  dungCachCuc: false,
} satisfies CungLuanBang;
