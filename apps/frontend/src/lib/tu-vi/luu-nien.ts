import { CHI_COUNT, mod12 } from '@/lib/tu-vi/chi';
import { DAI_VAN_LABELS, type DaiVan } from '@/lib/tu-vi/van-han';

/**
 * Nhãn `LN.*` — vòng lưu niên. Neo vào cung đại vận đang hiệu lực chứ không vào địa bàn gốc.
 *
 * Luật dò từ 57 lá số tuvi.vn rồi kiểm trên 24 lá số giữ riêng chưa từng dùng để dò: 81 lá số,
 * 972 nhãn, không sai ô nào.
 */

/** Số năm đã đi trong đại vận hiện tại quyết định `LN.MỆNH` cách `ĐV.MỆNH` bao nhiêu cung. */
const OFFSET_BY_YEAR_IN_SPAN: readonly number[] = [0, 6, 5, 6, 7, 8, 9, 10, 11, 0];

/**
 * Năm thứ tư của một đại vận **đi nghịch** là trường hợp duy nhất vòng lưu niên chạy ngược: tên cung
 * giảm dần theo chi thay vì tăng.
 *
 * Nhiều khả năng đây là lỗi của tuvi.vn chứ không phải luật tử vi — không phái nào đảo chiều vòng
 * mười hai cung ở đúng một năm của đúng một chiều vận. Repo giữ theo tuvi.vn vì đó là nguồn chân lý
 * đã chọn, nhưng chỗ này mới có bảy lá số chứng thực, ít hơn hẳn phần còn lại của luật.
 */
const REVERSED_YEAR_IN_SPAN = 4;

export interface LuuNienParams {
  readonly spans: readonly DaiVan[];
  /** Tuổi mụ của năm đang xem. */
  readonly age: number;
  /** Dương Nam và Âm Nữ đi thuận — cùng chiều đại vận. */
  readonly isForward: boolean;
}

/** Mười hai nhãn theo chi. Ngoài khoảng đại vận đã tính thì trả về mảng rỗng. */
export function anLuuNienLabels(params: LuuNienParams): readonly string[] {
  const current = params.spans.find(
    (span) => params.age >= span.startAge && params.age <= span.endAge,
  );
  if (!current) {
    return new Array<string>(CHI_COUNT).fill('');
  }

  const yearInSpan = params.age - current.startAge;
  const offset = OFFSET_BY_YEAR_IN_SPAN[yearInSpan];
  const menhIndex = mod12(current.chiIndex + (params.isForward ? offset : -offset));
  const step = !params.isForward && yearInSpan === REVERSED_YEAR_IN_SPAN ? -1 : 1;

  const labels = new Array<string>(CHI_COUNT).fill('');
  DAI_VAN_LABELS.forEach((name, order) => {
    labels[mod12(menhIndex + step * order)] = `LN.${name}`;
  });
  return labels;
}
