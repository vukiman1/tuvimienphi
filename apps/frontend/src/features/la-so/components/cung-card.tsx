import type { ReactElement } from 'react';
import { FOCUS_RING_CLASS } from '@/design-system';
import type { CungView } from '@/features/la-so/chart-types';
import {
  CHART_RULE_CLASS,
  CUNG_SURFACE_CLASS,
  cungStateClass,
} from '@/features/la-so/chart-colors';
import { CungCellContent } from '@/features/la-so/components/cung-cell-content';
import { cn } from '@/lib/utils';

interface CungCardProps {
  readonly buttonRef: (button: HTMLButtonElement | null) => void;
  readonly cung: CungView;
  readonly sizingCung?: CungView;
  readonly isFocused: boolean;
  readonly isRelated: boolean;
  readonly isSelected: boolean;
  readonly onSelect: (cungIndex: number) => void;
  readonly onFocusCung: (cungIndex: number | null) => void;
}

export function CungCard({
  buttonRef,
  cung,
  sizingCung,
  isFocused,
  isRelated,
  isSelected,
  onSelect,
  onFocusCung,
}: CungCardProps): ReactElement {
  return (
    <button
      aria-label={`Cung ${cung.name}`}
      aria-pressed={isSelected}
      onBlur={() => onFocusCung(null)}
      onClick={() => onSelect(cung.index)}
      onFocus={() => onFocusCung(cung.index)}
      onMouseEnter={() => onFocusCung(cung.index)}
      onMouseLeave={() => onFocusCung(null)}
      ref={buttonRef}
      type="button"
      className={cn(
        'relative block h-full w-full overflow-hidden border px-1 py-3 text-left transition-colors focus-visible:z-30',
        FOCUS_RING_CLASS,
        CHART_RULE_CLASS.border,
        isFocused || isRelated ? CUNG_SURFACE_CLASS.spotlight : CUNG_SURFACE_CLASS.base,
        cungStateClass(isSelected, isFocused, isRelated),
      )}
    >
      {sizingCung === undefined ? (
        <CungCellContent cung={cung} />
      ) : (
        <span className="grid h-full">
          <span className="col-start-1 row-start-1 flex flex-col">
            <CungCellContent cung={cung} />
          </span>
          <span aria-hidden="true" className="invisible col-start-1 row-start-1 flex flex-col">
            <CungCellContent cung={sizingCung} />
          </span>
        </span>
      )}
    </button>
  );
}
