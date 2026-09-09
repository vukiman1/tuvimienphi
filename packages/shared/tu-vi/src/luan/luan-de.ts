import type { SaoName } from '../sao-names.js';

/** Chiều của một mệnh đề trong mạch bài: thuận mở ra, nghịch cản lại, hoá giải làm nhẹ phần nghịch. */
export enum Sac {
  Thuan = 'thuan',
  Nghich = 'nghich',
  HoaGiai = 'hoa-giai',
}

/**
 * Một kết luận đã viết sẵn về người xem. Tầng luận không sinh ra mệnh đề mới — nó chỉ chọn, xếp
 * hạng, đảo chiều và cắt bớt những mệnh đề người đã soạn.
 */
export interface LuanDe {
  readonly y: string;
  /** Sao sinh ra mệnh đề. Bài viết phải nhắc ít nhất một trong số này ở cùng câu với `y`. */
  readonly do: readonly SaoName[];
  readonly sac: Sac;
  readonly trong: number;
  /**
   * Chữ bắt buộc xuất hiện nguyên văn trong bài. Không có ràng buộc này thì mô hình ngôn ngữ làm
   * nhạt mệnh đề bất lợi cho dễ đọc, và không bộ kiểm hình thức nào thấy được.
   */
  readonly tuKhoa: readonly string[];
}
