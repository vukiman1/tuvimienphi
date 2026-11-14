import { useRef, useState, type ReactElement } from 'react';
import type { BirthInput } from '@/features/la-so/birth-input';
import { ringNeighbour } from '@/features/la-so/board-navigation';
import type { ChartView } from '@/features/la-so/chart-types';
import { CungPanel } from '@/features/la-so/components/cung-panel';
import { CungSheet } from '@/features/la-so/components/cung-sheet';
import { LaSoBoard, type LaSoBoardHandle } from '@/features/la-so/components/la-so-board';
import { DESKTOP_WORKSPACE_QUERY } from '@/features/la-so/components/la-so-workspace.constants';
import { cungNameOf } from '@/features/la-so/cung-slug';
import { useMediaQuery } from '@/hooks/use-media-query';

export interface LaSoWorkspaceProps {
  readonly chart: ChartView;
  readonly birth: BirthInput;
  readonly viewYear: number;
  readonly selectedIndex: number;
  readonly onSelect: (index: number) => void;
  readonly onReadChapter: (order: string) => void;
}

export function LaSoWorkspace({
  chart,
  birth,
  viewYear,
  selectedIndex,
  onSelect,
  onReadChapter,
}: LaSoWorkspaceProps): ReactElement {
  const isDesktop = useMediaQuery(DESKTOP_WORKSPACE_QUERY);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [wasDesktop, setWasDesktop] = useState(isDesktop);
  const boardRef = useRef<LaSoBoardHandle>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const chapterAfterClose = useRef<string | null>(null);

  if (wasDesktop !== isDesktop) {
    setWasDesktop(isDesktop);
    setIsSheetOpen(false);
  }

  const selectCung = (index: number): void => {
    onSelect(index);
    if (!isDesktop) setIsSheetOpen(true);
    else if (panelRef.current) panelRef.current.scrollTop = 0;
  };

  const readChapterFromSheet = (order: string): void => {
    chapterAfterClose.current = order;
    setIsSheetOpen(false);
  };

  const handOverFocus = (): void => {
    const order = chapterAfterClose.current;
    chapterAfterClose.current = null;
    if (order === null) {
      boardRef.current?.focusCung(selectedIndex);
      return;
    }
    onReadChapter(order);
  };

  const panel = (
    <CungPanel
      birth={birth}
      chart={chart}
      index={selectedIndex}
      onReadChapter={isDesktop ? onReadChapter : readChapterFromSheet}
      viewYear={viewYear}
    />
  );

  return (
    <section className="bg-night">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_26rem]">
          <LaSoBoard
            boardRef={boardRef}
            chart={chart}
            onSelect={selectCung}
            selectedIndex={selectedIndex}
          />
          {isDesktop ? (
            <div
              ref={panelRef}
              className="sticky top-6 max-h-workspace-panel self-start overflow-y-auto rounded-2xl border border-gold/40 bg-day p-6 text-ink shadow-glow-gold"
            >
              {panel}
            </div>
          ) : (
            <CungSheet
              onCloseFocus={handOverFocus}
              onOpenChange={setIsSheetOpen}
              onStep={(step) => onSelect(ringNeighbour(selectedIndex, step))}
              open={isSheetOpen}
              title={`Cung ${cungNameOf(chart.cungs[selectedIndex])}`}
            >
              {panel}
            </CungSheet>
          )}
        </div>
      </div>
    </section>
  );
}
