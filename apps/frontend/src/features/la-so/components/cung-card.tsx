import type { CungView, SaoView } from '@/features/la-so/chart-types';
import { cn } from '@/lib/utils';
import {
  CHART_RULE_CLASS,
  CUNG_SURFACE_CLASS,
  SAO_ELEMENT_CLASS,
} from '@/features/la-so/chart-colors';

interface CungCardProps {
  readonly cung: CungView;
  /** Cung đang được rê chuột hoặc đang chọn — quyết định màu nền đậm. */
  readonly isFocused: boolean;
  /** Tam hợp hoặc xung chiếu của cung đang focus. */
  readonly isRelated: boolean;
  /** Cung đang chọn bằng click, chỉ dùng cho `aria-pressed`. */
  readonly isSelected: boolean;
  /** Không nằm trong tam phương tứ chính của cung đang rê chuột. */
  readonly isDimmed: boolean;
  readonly onSelect: (cungIndex: number) => void;
  readonly onFocusCung: (cungIndex: number | null) => void;
}

function SaoColumn({
  sao,
  align,
}: {
  readonly sao: readonly SaoView[];
  readonly align: 'left' | 'right';
}) {
  return (
    <ul className={cn('flex min-w-0 flex-col gap-[1px]', align === 'right' && 'items-start')}>
      {sao.map((item) => (
        <li
          key={item.name}
          className={cn(
            'truncate text-[13px] leading-[18px] font-semibold',
            SAO_ELEMENT_CLASS[item.element],
          )}
        >
          {item.name}
          {item.rating && <span className="text-[11px] font-normal"> ({item.rating})</span>}
        </li>
      ))}
    </ul>
  );
}

export function CungCard({
  cung,
  isFocused,
  isRelated,
  isSelected,
  isDimmed,
  onSelect,
  onFocusCung,
}: CungCardProps) {
  return (
    <button
      aria-label={`Cung ${cung.name}`}
      aria-pressed={isSelected}
      onBlur={() => onFocusCung(null)}
      onClick={() => onSelect(cung.index)}
      onFocus={() => onFocusCung(cung.index)}
      onMouseEnter={() => onFocusCung(cung.index)}
      onMouseLeave={() => onFocusCung(null)}
      type="button"
      className={cn(
        'relative block h-full w-full overflow-hidden border px-[4px] py-[11px] text-left transition-colors outline-none',
        CHART_RULE_CLASS.border,
        'focus-visible:ring-2 focus-visible:ring-[#e08a0b]',
        isFocused
          ? CUNG_SURFACE_CLASS.focused
          : isRelated
            ? CUNG_SURFACE_CLASS.related
            : CUNG_SURFACE_CLASS.base,
      )}
    >
      <span className={cn('flex h-full flex-col transition-opacity', isDimmed && 'opacity-30')}>
        <div className="flex items-baseline justify-between gap-1">
          <span className="shrink-0 text-[13px] leading-[17px] font-bold whitespace-nowrap text-[#17150f]">
            {cung.canChi}
          </span>
          <span className="truncate text-[15px] leading-[19px] font-bold tracking-wide text-[#e08a0b]">
            {cung.name}
            {cung.isThan && <span className="text-[#17150f]">&lt;THÂN&gt;</span>}
          </span>
          <span className="text-[13px] leading-[17px] font-bold text-[#17150f] tabular-nums">
            {cung.daiVanStartAge}
          </span>
        </div>

        <div className="flex items-baseline justify-between gap-1">
          <span className="shrink-0 text-[13px] leading-[17px] font-bold whitespace-nowrap text-[#17150f]">
            {cung.element}
          </span>
          <span className="flex min-w-0 flex-wrap justify-center gap-x-2">
            {cung.chinhTinh.map((sao) => (
              <span
                key={sao.name}
                className={cn(
                  'text-[14px] leading-[19px] font-bold whitespace-nowrap',
                  SAO_ELEMENT_CLASS[sao.element],
                )}
              >
                {sao.polarity}
                {sao.name}
                {sao.rating && <span className="text-[12px] font-normal"> ({sao.rating})</span>}
              </span>
            ))}
          </span>
          <span className="shrink-0 text-[13px] leading-[17px] font-bold whitespace-nowrap text-[#17150f]">
            {cung.monthOrder}
          </span>
        </div>

        <div className="mt-[3px] grid flex-1 grid-cols-2 gap-x-1">
          <SaoColumn align="left" sao={cung.catTinh} />
          <SaoColumn align="right" sao={cung.hungTinh} />
        </div>

        {cung.luuTinh.length > 0 && (
          <ul className="flex flex-wrap gap-x-2 pt-[2px] text-[12px] leading-[16px] font-semibold">
            {cung.luuTinh.map((sao) => (
              <li
                key={sao.name}
                className={cn('whitespace-nowrap', SAO_ELEMENT_CLASS[sao.element])}
              >
                L.{sao.name}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-baseline justify-between gap-1 pt-[4px] text-[12px] leading-[16px] font-semibold text-[#17150f]">
          <span>{cung.daiVan}</span>
          <span className="font-bold">{cung.trangSinh}</span>
          <span>{cung.luuNien}</span>
        </div>
      </span>
    </button>
  );
}
