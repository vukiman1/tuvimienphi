import type { Sac } from '@org/shared-tu-vi';

/**
 * Bài đưa vào bộ kiểm, tách khỏi hình dạng cụ thể của từng loại. Hai đoạn chính và một mục con đi
 * qua đúng năm tầng kiểm giống nhau, chỉ khác số đoạn và khác chỗ đặt mệnh đề của mỗi sắc thái.
 */
export interface BaiCanKiem {
  readonly doan: readonly string[];
  /** Mệnh đề sắc thái này phải xuất hiện ở đoạn số mấy. */
  readonly doanCuaSac: Readonly<Record<Sac, number>>;
}
