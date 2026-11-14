import type { CungLuanBang } from '../cung-luan-bang.js';
import { CHINH_TINH_PHUC_DUC } from './chinh-tinh-phuc-duc.js';
import { PHU_TINH_PHUC_DUC } from './phu-tinh-phuc-duc.js';

export const BANG_PHUC_DUC = {
  cung: 'Phúc Đức',
  chinhTinh: CHINH_TINH_PHUC_DUC,
  phuTinh: PHU_TINH_PHUC_DUC,
  hoaKy: {
    y: 'phúc phần bị vướng lại, muốn lòng được yên thì cũng phải qua trắc trở',
    tuKhoa: ['vướng lại', 'trắc trở'],
  },
  dungCachCuc: false,
} satisfies CungLuanBang;
