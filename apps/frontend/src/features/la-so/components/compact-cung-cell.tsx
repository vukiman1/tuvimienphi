import type { ReactElement } from 'react';
import { FOCUS_RING_CLASS } from '@/design-system';
import type { CungView } from '@/features/la-so/chart-types';
import {
  CHART_RULE_CLASS,
  CUNG_SURFACE_CLASS,
  SAO_ON_NIGHT_CLASS,
  cungStateClass,
} from '@/features/la-so/chart-colors';
import { cn } from '@/lib/utils';

interface CompactCungCellProps {
  readonly buttonRef: (button: HTMLButtonElement | null) => void;
  readonly cung: CungView;
  readonly isPicked: boolean;
  readonly isRelated: boolean;
  readonly onSelect: (cungIndex: number) => void;
}

export function CompactCungCell({
  buttonRef,
  cung,
  isPicked,
  isRelated,
  onSelect,
}: CompactCungCellProps): ReactElement {
  return (
    <button
      aria-label={`Cung ${cung.name}`}
      aria-pressed={isPicked}
      onClick={() => onSelect(cung.index)}
      ref={buttonRef}
      type="button"
      className={cn(
        'relative flex h-full min-h-24 w-full flex-col items-center gap-0.5 overflow-hidden px-0.5 pt-3 pb-1.5 text-center transition-colors focus-visible:z-30',
        FOCUS_RING_CLASS,
        isPicked || isRelated ? CUNG_SURFACE_CLASS.spotlight : CUNG_SURFACE_CLASS.base,
        cungStateClass(isPicked, false, isRelated),
      )}
    >
      {cung.isTieuHan ? (
        <span
          className={cn(
            'pointer-events-none absolute top-0 inset-x-0 text-2xs leading-3 font-bold',
            CHART_RULE_CLASS.blockLabel,
          )}
        >
          Tiểu hạn
        </span>
      ) : null}
      <span className="flex w-full flex-col items-center gap-0.5">
        <span className="text-2xs leading-3 text-day-soft">{cung.canChi}</span>
        <span className="text-xs leading-4 font-bold break-words text-dawn">
          {cung.name}
          {cung.isThan && <span className="block text-day-soft">&lt;THÂN&gt;</span>}
        </span>
        {cung.isVoChinhDieu ? (
          <span className="text-2xs leading-3 text-day-soft">vô chính diệu</span>
        ) : (
          cung.chinhTinh.map((sao) => (
            <span
              key={sao.name}
              className={cn('text-xs leading-4 font-semibold', SAO_ON_NIGHT_CLASS[sao.element])}
            >
              {sao.name}
            </span>
          ))
        )}
      </span>
    </button>
  );
}
