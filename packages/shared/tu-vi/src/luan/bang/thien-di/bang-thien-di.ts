import type { CungLuanBang } from '../cung-luan-bang.js';
import { CHINH_TINH_THIEN_DI } from './chinh-tinh-thien-di.js';
import { PHU_TINH_THIEN_DI } from './phu-tinh-thien-di.js';

export const BANG_THIEN_DI = {
  cung: 'Thiên Di',
  chinhTinh: CHINH_TINH_THIEN_DI,
  phuTinh: PHU_TINH_THIEN_DI,
  hoaKy: {
    y: 'đường ra ngoài có lúc bị vướng lại, muốn đi xa hay mở rộng giao thiệp thì cũng phải qua trắc trở',
    tuKhoa: ['vướng lại', 'trắc trở'],
  },
  dungCachCuc: true,
} satisfies CungLuanBang;
