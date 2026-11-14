import type { CungLuanBang } from '../cung-luan-bang.js';
import { CHINH_TINH_NO_BOC } from './chinh-tinh-no-boc.js';
import { PHU_TINH_NO_BOC } from './phu-tinh-no-boc.js';

export const BANG_NO_BOC = {
  cung: 'Nô Bộc',
  chinhTinh: CHINH_TINH_NO_BOC,
  phuTinh: PHU_TINH_NO_BOC,
  hoaKy: {
    y: 'phần giúp đỡ từ bạn bè bị vướng lại, muốn được người quen đỡ thì cũng phải qua trắc trở',
    tuKhoa: ['vướng lại', 'trắc trở'],
  },
  dungCachCuc: false,
} satisfies CungLuanBang;
