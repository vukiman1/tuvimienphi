import { useState } from 'react';
import type { PhiTinhBoard } from '@/lib/phi-tinh';

interface PhiTinhBoardsProps {
  readonly boards: readonly PhiTinhBoard[];
}

export function PhiTinhBoards({ boards }: PhiTinhBoardsProps) {
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  return (
    <div className="rounded-xl border border-[#c9a15c]/40 bg-card p-3 shadow-md md:p-4">
      <div className="flex items-center justify-center gap-3 py-1">
        <span className="h-px max-w-24 flex-1 bg-gradient-to-r from-transparent to-[#c9a15c]/70" />
        <p className="font-display text-lg font-bold whitespace-nowrap text-primary">
          Cửu Cung Phi Tinh
        </p>
        <span className="h-px max-w-24 flex-1 bg-gradient-to-l from-transparent to-[#c9a15c]/70" />
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
              className={`rounded-lg border p-2 transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring/60 ${
                isSelected
                  ? 'border-[#c9a15c] bg-[#c9a15c]/10 shadow-[0_0_0_1px_#c9a15c66]'
                  : 'border-[#c9a15c]/30 hover:border-[#c9a15c]/70 hover:bg-primary/5'
              }`}
            >
              <p className="pb-1.5 text-center text-xs font-bold tracking-wide text-foreground uppercase">
                {board.label}
              </p>
              <div className="grid grid-cols-3 overflow-hidden rounded-md border border-[#c9a15c]/40">
                {board.cells.map((cell, index) => (
                  <span
                    key={index}
                    className={`flex aspect-square items-center justify-center border-[#c9a15c]/25 font-display text-lg font-bold [&:nth-child(-n+6)]:border-b [&:not(:nth-child(3n))]:border-r ${
                      cell.isGood ? 'text-destructive' : 'text-foreground'
                    }`}
                  >
                    {cell.value}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {selectedLabel ? (
        <div className="mt-3 rounded-lg border border-dashed border-[#c9a15c]/40 bg-muted/30 px-3 py-4 text-center">
          <p className="text-sm font-semibold text-foreground">Phi tinh {selectedLabel}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Luận giải chi tiết đang được xây dựng.
          </p>
        </div>
      ) : (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Bấm vào từng bảng Phi Tinh để xem chi tiết.
        </p>
      )}
    </div>
  );
}
