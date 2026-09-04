import { CHI_COUNT, mod12 } from '@/lib/tu-vi/chi';

const DAI_VAN_SPAN = 10;

export enum Gender {
  Nam = 'nam',
  Nu = 'nu',
}

export interface AmDuong {
  readonly label: string;
  /** Dương Nam và Âm Nữ đi thuận, hai trường hợp còn lại đi nghịch. */
  readonly isForward: boolean;
}

/** Can chẵn là dương, can lẻ là âm — Giáp dương, Ất âm, và cứ thế xen kẽ. */
export function anAmDuong(yearCan: number, gender: Gender): AmDuong {
  const isDuong = yearCan % 2 === 0;
  const isNam = gender === Gender.Nam;
  return {
    label: `${isDuong ? 'Dương' : 'Âm'} ${isNam ? 'Nam' : 'Nữ'}`,
    isForward: isDuong === isNam,
  };
}

export interface DaiVan {
  readonly chiIndex: number;
  readonly startAge: number;
  readonly endAge: number;
}

/**
 * Đại vận khởi tại cung Mệnh với tuổi bằng đúng số cục, mỗi cung trọn mười năm. Chiều đi do âm
 * dương nam nữ quyết định, nên hai người sinh cùng giờ khác giới chạy vận ngược nhau.
 */
export function anDaiVan(menhIndex: number, cuc: number, isForward: boolean): readonly DaiVan[] {
  return Array.from({ length: CHI_COUNT }, (_, step) => {
    const offset = isForward ? step : -step;
    const startAge = cuc + step * DAI_VAN_SPAN;
    return {
      chiIndex: mod12(menhIndex + offset),
      startAge,
      endAge: startAge + DAI_VAN_SPAN - 1,
    };
  });
}

/**
 * Mười hai nhãn đại vận, viết tắt như trên lá số. Xếp thuận từ cung đang đi đại vận, cùng thứ tự
 * với mười hai cung gốc.
 */
/** Tên viết tắt mười hai cung, dùng chung cho nhãn `ĐV.*` và `LN.*`. */
export const DAI_VAN_LABELS = [
  'MỆNH',
  'PHỤ',
  'PHÚC',
  'ĐIỀN',
  'QUAN',
  'NÔ',
  'DI',
  'TẬT',
  'TÀI',
  'TỬ',
  'PHỐI',
  'HUYNH',
] as const;

/** Tuổi mụ: sinh ra đã là một tuổi, nên tuổi trong năm xem hơn hiệu số năm đúng một. */
export function ageInYear(birthLunarYear: number, viewYear: number): number {
  return viewYear - birthLunarYear + 1;
}

/**
 * Nhãn `ĐV.*` cho mười hai cung: cung chứa đại vận của tuổi năm xem thành `ĐV.MỆNH`, các cung sau
 * đếm thuận. Ngoài khoảng đại vận đã tính thì không có nhãn nào.
 */
export function anDaiVanLabels(spans: readonly DaiVan[], age: number): readonly string[] {
  const current = spans.find((span) => age >= span.startAge && age <= span.endAge);
  if (!current) {
    return new Array<string>(CHI_COUNT).fill('');
  }

  return Array.from({ length: CHI_COUNT }, (_, chiIndex) => {
    const offset = mod12(chiIndex - current.chiIndex);
    return `ĐV.${DAI_VAN_LABELS[offset]}`;
  });
}
