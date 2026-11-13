import { useState, type ReactElement } from 'react';
import { FOCUS_RING_CLASS } from '@/design-system';
import type { PhiTinhBoard } from '@/lib/phi-tinh';
import { cn } from '@/lib/utils';

const PHI_TINH_CELL_CLASS = {
  good: 'font-display font-extrabold text-hanh-hoa ring-1 ring-inset ring-hanh-hoa',
  plain: 'font-semibold text-ink',
} as const;

interface PhiTinhBoardsProps {
  readonly boards: readonly PhiTinhBoard[];
}

export function PhiTinhBoards({ boards }: PhiTinhBoardsProps): ReactElement {
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border border-ink/15 bg-day p-4 md:p-5">
      <div className="flex items-center justify-center gap-3 py-1">
        <span aria-hidden className="h-px max-w-24 flex-1 bg-ink/15" />
        <h2 className="text-center font-emphasis text-2xl font-bold text-ink">Cửu Cung Phi Tinh</h2>
        <span aria-hidden className="h-px max-w-24 flex-1 bg-ink/15" />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {boards.map((board) => {
          const isSelected = selectedLabel === board.label;

          return (
            <button
              key={board.label}
              aria-pressed={isSelected}
              type="button"
              onClick={() => setSelectedLabel(isSelected ? null : board.label)}
              className={cn(
                'rounded-xl border p-2 transition-colors',
                FOCUS_RING_CLASS,
                isSelected
                  ? 'border-transparent bg-gold/10 inset-ring-2 inset-ring-ink'
                  : 'border-ink/15 hover:border-ink/40',
              )}
            >
              <p className="pb-1.5 text-center text-xs font-bold tracking-wide text-ink uppercase">
                {board.label}
              </p>
              <div className="grid grid-cols-3 overflow-hidden rounded-md border border-ink/20">
                {board.cells.map((cell, index) => (
                  <span
                    key={index}
                    className={cn(
                      'flex aspect-square items-center justify-center border-ink/15 text-lg [&:nth-child(-n+6)]:border-b [&:not(:nth-child(3n))]:border-r',
                      PHI_TINH_CELL_CLASS[cell.isGood ? 'good' : 'plain'],
                    )}
                  >
                    {cell.value}
                    {cell.isGood && <span className="sr-only"> (sao tốt)</span>}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {selectedLabel ? (
        <div className="mt-3 rounded-lg border border-dashed border-ink/20 bg-day-200 px-3 py-4 text-center">
          <p className="text-sm font-semibold text-ink">Phi tinh {selectedLabel}</p>
          <p className="mt-0.5 text-xs text-ink-soft">Luận giải chi tiết đang được xây dựng.</p>
        </div>
      ) : (
        <p className="mt-3 text-center text-xs text-ink-soft">
          Bấm vào từng bảng Phi Tinh để xem chi tiết.
        </p>
      )}
    </div>
  );
}
