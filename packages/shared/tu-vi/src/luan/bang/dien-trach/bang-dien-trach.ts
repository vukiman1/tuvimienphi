import type { CungLuanBang } from '../cung-luan-bang.js';
import { CHINH_TINH_DIEN_TRACH } from './chinh-tinh-dien-trach.js';
import { PHU_TINH_DIEN_TRACH } from './phu-tinh-dien-trach.js';

export const BANG_DIEN_TRACH = {
  cung: 'Điền Trạch',
  chinhTinh: CHINH_TINH_DIEN_TRACH,
  phuTinh: PHU_TINH_DIEN_TRACH,
  hoaKy: {
    y: 'chuyện nhà đất có lúc bị vướng lại, muốn ổn định nơi ở thì cũng phải qua trắc trở',
    tuKhoa: ['vướng lại', 'trắc trở'],
  },
  dungCachCuc: false,
} satisfies CungLuanBang;
