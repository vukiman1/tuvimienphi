import { CUNG_SURFACE_CLASS } from '@/features/la-so/chart-colors';

/**
 * Đổi năm xem. Bốn tầng đổi theo nó — nhãn `ĐV.*`, nhãn `LN.*`, cung tiểu hạn và cung tháng; sao
 * gốc đứng yên.
 */

/** Đủ phủ trọn mười hai đại vận, mỗi vận mười năm, kể từ năm sinh. */
const SPAN_YEARS = 120;

interface ViewYearPickerProps {
  readonly birthYear: number;
  readonly value: number;
  readonly onChange: (year: number) => void;
}

export function ViewYearPicker({ birthYear, value, onChange }: ViewYearPickerProps) {
  // Dải luôn phải chứa năm đang xem: thiếu nó thì `<select>` rơi về mục đầu và hiện một năm khác
  // hẳn năm lá số đang tính — người sinh trước 1907 gặp ngay khi mở trang.
  const firstYear = Math.min(birthYear, value);
  const lastYear = Math.max(birthYear + SPAN_YEARS - 1, value);
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, index) => firstYear + index);

  return (
    <label className="inline-flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Năm xem</span>
      <select
        aria-label="Năm xem"
        className={`cursor-pointer appearance-none rounded-full px-4 py-1.5 text-sm font-semibold text-[#5b5347] outline-none focus-visible:ring-2 focus-visible:ring-[#e08a0b] ${CUNG_SURFACE_CLASS.related}`}
        onChange={(event) => onChange(Number(event.target.value))}
        value={value}
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </label>
  );
}
