/**
 * Địa bàn là lưới 4×4: 12 cung chạy vòng ngoài bắt đầu từ Tị ở góc trên trái, thiên bàn chiếm 2×2
 * ở giữa. Thứ tự này là quy ước cố định của lá số nên ghi thẳng ra bảng.
 */
export interface GridPosition {
  readonly row: number;
  readonly column: number;
}

export const BOARD_SIZE = 4;

/** Khoá theo index địa chi (0 = Tý … 11 = Hợi). */
export const CUNG_GRID_POSITIONS: readonly GridPosition[] = [
  { row: 4, column: 3 }, // Tý
  { row: 4, column: 2 }, // Sửu
  { row: 4, column: 1 }, // Dần
  { row: 3, column: 1 }, // Mão
  { row: 2, column: 1 }, // Thìn
  { row: 1, column: 1 }, // Tị
  { row: 1, column: 2 }, // Ngọ
  { row: 1, column: 3 }, // Mùi
  { row: 1, column: 4 }, // Thân
  { row: 2, column: 4 }, // Dậu
  { row: 3, column: 4 }, // Tuất
  { row: 4, column: 4 }, // Hợi
];

const CENTER_EDGE_MIN = 1;
const CENTER_EDGE_MAX = BOARD_SIZE - 1;

function clampToCenterEdge(value: number): number {
  return Math.min(Math.max(value, CENTER_EDGE_MIN), CENTER_EDGE_MAX);
}

/**
 * Điểm neo của một cung trên viền thiên bàn, trong hệ toạ độ `viewBox="0 0 4 4"`.
 *
 * Neo là điểm trên viền thiên bàn **gần cung đó nhất**: lấy tâm ô cung rồi kéo về trong phạm vi
 * thiên bàn. Thiên bàn là hình lồi nên mọi đường nối hai neo đều nằm trọn bên trong nó — không bị
 * cắt cụt ở mép, cũng không chọc sang che chữ trong các cung. Đây cũng là chỗ đặt nhãn địa chi.
 */
export function centerAnchor(cungIndex: number): { readonly x: number; readonly y: number } {
  const { row, column } = CUNG_GRID_POSITIONS[cungIndex];
  return { x: clampToCenterEdge(column - 0.5), y: clampToCenterEdge(row - 0.5) };
}

/** Nhãn ở cạnh trái/phải cần lùi vào nhiều hơn cạnh trên/dưới thì mới thoát khỏi viền ô cung. */
const LABEL_INSET_X = '12px';
const LABEL_INSET_Y = '4px';

/**
 * Nhãn nằm sát mép nào thì canh theo mép đó (không canh giữa), nếu không nửa chữ sẽ tràn ra ngoài
 * thiên bàn và đè lên viền ô cung.
 */
function insetAlign(value: number, inset: string): string {
  if (value === CENTER_EDGE_MIN) return inset;
  if (value === CENTER_EDGE_MAX) return `calc(-100% - ${inset})`;
  return '-50%';
}

/** Vị trí và phép dịch của nhãn địa chi đặt quanh viền thiên bàn. */
export function centerAnchorLabel(cungIndex: number): {
  readonly left: string;
  readonly top: string;
  readonly transform: string;
} {
  const { x, y } = centerAnchor(cungIndex);
  return {
    left: `${(x / BOARD_SIZE) * 100}%`,
    top: `${(y / BOARD_SIZE) * 100}%`,
    transform: `translate(${insetAlign(x, LABEL_INSET_X)}, ${insetAlign(y, LABEL_INSET_Y)})`,
  };
}

const TAM_HOP_STEPS = [4, 8];
const XUNG_CHIEU_STEP = 6;
const CHI_COUNT = 12;

export function tamHopIndexes(cungIndex: number): readonly number[] {
  return TAM_HOP_STEPS.map((step) => (cungIndex + step) % CHI_COUNT);
}

export function xungChieuIndex(cungIndex: number): number {
  return (cungIndex + XUNG_CHIEU_STEP) % CHI_COUNT;
}

/**
 * Nhị hợp (lục hợp): sáu cặp Tý–Sửu, Dần–Hợi, Mão–Tuất, Thìn–Dậu, Tị–Thân, Ngọ–Mùi. Hai chi trong
 * một cặp luôn có tổng chỉ số bằng 1 (tính vòng), nên soi gương qua mốc đó là ra bạn của nó.
 */
const NHI_HOP_MIRROR = 1;

export function nhiHopIndex(cungIndex: number): number {
  return (((NHI_HOP_MIRROR - cungIndex) % CHI_COUNT) + CHI_COUNT) % CHI_COUNT;
}

/**
 * Vị trí (theo % của bàn) để đặt nhãn Tuần / Triệt: chúng đè lên đúng cạnh chung của hai cung bị
 * chắn — cạnh dọc nếu hai cung cùng hàng, cạnh ngang nếu cùng cột.
 */
export function sharedEdge(pair: readonly [number, number]): {
  readonly left: string;
  readonly top: string;
} {
  const [a, b] = pair.map((index) => CUNG_GRID_POSITIONS[index]);
  const toPercent = (value: number) => `${(value / BOARD_SIZE) * 100}%`;
  if (a.row === b.row) {
    return { left: toPercent(Math.max(a.column, b.column) - 1), top: toPercent(a.row) };
  }
  return { left: toPercent(a.column - 0.5), top: toPercent(Math.max(a.row, b.row) - 1) };
}
