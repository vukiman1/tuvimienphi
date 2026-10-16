import type { CungLuanBang } from '../cung-luan-bang.js';
import { CHINH_TINH_TU_TUC } from './chinh-tinh-tu-tuc.js';
import { PHU_TINH_TU_TUC } from './phu-tinh-tu-tuc.js';

export const BANG_TU_TUC = {
  cung: 'Tử Tức',
  chinhTinh: CHINH_TINH_TU_TUC,
  phuTinh: PHU_TINH_TU_TUC,
  hoaKy: {
    y: 'khi có con, sự gần gũi giữa hai bên có lúc bị vướng lại, muốn hiểu nhau thì cũng phải qua trắc trở',
    tuKhoa: ['vướng lại', 'trắc trở'],
  },
  dungCachCuc: false,
} satisfies CungLuanBang;
