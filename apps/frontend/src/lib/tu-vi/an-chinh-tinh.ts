import { mod12 } from '@/lib/tu-vi/chi';
import type { ChinhTinhName } from '@/lib/tu-vi/sao-names';
import type { SaoPlacement } from '@/lib/tu-vi/sao-placement';

/**
 * Vòng Tử Vi đi nghịch, tính bằng số bước lùi kể từ Tử Vi. Thiên Cơ sát ngay sau, rồi hụt một cung
 * mới tới Thái Dương — chỗ hụt đó là lý do bảng này phải ghi ra thay vì đếm đều.
 */
const VONG_TU_VI: ReadonlyArray<readonly [ChinhTinhName, number]> = [
  ['Tử Vi', 0],
  ['Thiên Cơ', 1],
  ['Thái Dương', 3],
  ['Vũ Khúc', 4],
  ['Thiên Đồng', 5],
  ['Liêm Trinh', 8],
];

/** Vòng Thiên Phủ đi thuận, sáu sao đầu liền nhau rồi Phá Quân nhảy hẳn tới bước thứ mười. */
const VONG_THIEN_PHU: ReadonlyArray<readonly [ChinhTinhName, number]> = [
  ['Thiên Phủ', 0],
  ['Thái Âm', 1],
  ['Tham Lang', 2],
  ['Cự Môn', 3],
  ['Thiên Tướng', 4],
  ['Thiên Lương', 5],
  ['Thất Sát', 6],
  ['Phá Quân', 10],
];

/**
 * An Tử Vi: chia ngày sinh cho số cục, phần bù `r` quyết định đi tới hay lùi lại kể từ cung Dần.
 * `r` chẵn thì cộng, `r` lẻ thì trừ — đây là chỗ hai trường phái hay chép sai dấu.
 */
export function anTuVi(lunarDay: number, cuc: number): number {
  const quotient = Math.ceil(lunarDay / cuc);
  const remainder = quotient * cuc - lunarDay;
  const base = 2 + quotient - 1;
  return mod12(remainder % 2 === 0 ? base + remainder : base - remainder);
}

/** Thiên Phủ soi gương với Tử Vi qua trục Dần – Thân. */
export function anThienPhu(tuViIndex: number): number {
  return mod12(4 - tuViIndex);
}

export function anChinhTinh(lunarDay: number, cuc: number): readonly SaoPlacement<ChinhTinhName>[] {
  const tuVi = anTuVi(lunarDay, cuc);
  const thienPhu = anThienPhu(tuVi);

  return [
    ...VONG_TU_VI.map(([name, step]) => ({ name, chiIndex: mod12(tuVi - step) })),
    ...VONG_THIEN_PHU.map(([name, step]) => ({ name, chiIndex: mod12(thienPhu + step) })),
  ];
}
