import type { CungName } from '../../../dia-ban.js';
import type { ChinhTinhName } from '../../../sao-names.js';
import type { CellLuan } from '../cell-luan.js';
import { THAN_CU_MENH } from './menh.js';
import { THAN_CU_PHUC_DUC } from './phuc-duc.js';
import { THAN_CU_PHU_THE } from './phu-the.js';
import { THAN_CU_QUAN_LOC } from './quan-loc.js';
import { THAN_CU_TAI_BACH } from './tai-bach.js';
import { THAN_CU_THIEN_DI } from './thien-di.js';

/**
 * Mệnh đề nền cho MỘT chính tinh tại cung an Thân, tra theo cung rồi tới sao. Chia file theo cung vì
 * đó là đơn vị người soát tử vi làm việc: đọc trọn "Thân cư Mệnh" một lượt rồi mới sang cung khác.
 *
 * Ô cho tổ hợp đôi nằm ở `cap-doi-than-cu.ts` và được ưu tiên; không có ô riêng thì ghép từ hai ô
 * sao đơn ở đây.
 *
 * Toàn bộ nội dung là bản nháp, CHƯA có người biết tử vi soát. Đừng mở cho người dùng đọc trước khi
 * soát xong: văn nghe xuôi tai mà sai luật là kiểu sai không ai phát hiện ra.
 */
export const CHINH_TINH_THAN_CU: Readonly<
  Partial<Record<CungName, Partial<Record<ChinhTinhName, CellLuan>>>>
> = {
  Mệnh: THAN_CU_MENH,
  'Phúc Đức': THAN_CU_PHUC_DUC,
  'Quan Lộc': THAN_CU_QUAN_LOC,
  'Thiên Di': THAN_CU_THIEN_DI,
  'Tài Bạch': THAN_CU_TAI_BACH,
  'Phu Thê': THAN_CU_PHU_THE,
};
