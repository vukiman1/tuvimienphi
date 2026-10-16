import type { CungLuanBang } from '../cung-luan-bang.js';
import { CHINH_TINH_QUAN_LOC } from './chinh-tinh-quan-loc.js';
import { PHU_TINH_QUAN_LOC } from './phu-tinh-quan-loc.js';

export const BANG_QUAN_LOC = {
  cung: 'Quan Lộc',
  chinhTinh: CHINH_TINH_QUAN_LOC,
  phuTinh: PHU_TINH_QUAN_LOC,
  hoaKy: {
    y: 'phần thuận lợi bị vướng lại, muốn được việc thì cũng phải qua trắc trở',
    tuKhoa: ['vướng lại', 'trắc trở'],
  },
  dungCachCuc: true,
} satisfies CungLuanBang;
