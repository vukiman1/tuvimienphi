import type { CungLuanBang } from '../cung-luan-bang.js';
import { CHINH_TINH_TAT_ACH } from './chinh-tinh-tat-ach.js';
import { PHU_TINH_TAT_ACH } from './phu-tinh-tat-ach.js';

export const BANG_TAT_ACH = {
  cung: 'Tật Ách',
  chinhTinh: CHINH_TINH_TAT_ACH,
  phuTinh: PHU_TINH_TAT_ACH,
  hoaKy: {
    y: 'có lúc mệt mỏi bị vướng lại lâu hơn thường lệ, nên nghỉ đúng lúc thay vì cố gắng gượng',
    tuKhoa: ['vướng lại', 'nghỉ đúng lúc'],
  },
  dungCachCuc: false,
} satisfies CungLuanBang;
