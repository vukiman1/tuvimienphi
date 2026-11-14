import {
  useImperativeHandle,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
  type Ref,
} from 'react';
import { Orbit } from '@/design-system';
import type { ChartView, CungView } from '@/features/la-so/chart-types';
import { useElementWidth } from '@/hooks/use-element-width';
import {
  BOARD_SIZE,
  CUNG_GRID_POSITIONS,
  centerAnchorLabel,
  sharedEdge,
} from '@/features/la-so/board-layout';
import {
  BoardVariant,
  FULL_BOARD_WIDTH,
  boardScaleFor,
  boardVariantFor,
} from '@/features/la-so/board-fit';
import { boardHighlights, type BoardHighlights } from '@/features/la-so/board-highlights';
import { cungIndexInDirection, isBoardKey } from '@/features/la-so/board-navigation';
import { BoardDensity, cungForDensity } from '@/features/la-so/board-density';
import { useBoardDensity } from '@/features/la-so/use-board-density';
import { BoardDensityToggle } from '@/features/la-so/components/board-density-toggle';
import { BoardLegend } from '@/features/la-so/components/board-legend';
import { CHART_LINE_CLASS, CHART_RULE_CLASS } from '@/features/la-so/chart-colors';
import { CompactCungCell } from '@/features/la-so/components/compact-cung-cell';
import { CungCard } from '@/features/la-so/components/cung-card';
import { ThienBan } from '@/features/la-so/components/thien-ban';
import { cn } from '@/lib/utils';

export interface LaSoBoardHandle {
  readonly focusCung: (index: number) => void;
}

type RegisterCungButton = (cungIndex: number) => (button: HTMLButtonElement | null) => void;

interface LaSoBoardProps {
  readonly chart: ChartView;
  readonly selectedIndex: number;
  readonly onSelect: (cungIndex: number) => void;
  readonly boardRef?: Ref<LaSoBoardHandle>;
}

interface LineStyle {
  readonly strokeWidth: number;
  readonly vectorEffect?: 'non-scaling-stroke';
}

const CENTER_AREA = { gridRow: '2 / span 2', gridColumn: '2 / span 2' } as const;
const FULL_BOARD_MIN_ROW_HEIGHT = 258;
const FULL_LINE_STYLE: LineStyle = { strokeWidth: 0.008 };
const COMPACT_LINE_STYLE: LineStyle = { strokeWidth: 1.5, vectorEffect: 'non-scaling-stroke' };
const ORBIT_POINTS = 12;

function gridPlacement(cung: CungView): { readonly gridRow: number; readonly gridColumn: number } {
  const { row, column } = CUNG_GRID_POSITIONS[cung.index];
  return { gridRow: row, gridColumn: column };
}

function BlockLabel({
  label,
  pair,
}: {
  readonly label: string;
  readonly pair: readonly [number, number] | null;
}): ReactElement | null {
  if (pair === null) return null;
  return (
    <span
      className={cn(
        'pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 px-2.5 py-px text-2xs leading-4 font-bold',
        CHART_RULE_CLASS.blockLabel,
      )}
      style={sharedEdge(pair)}
    >
      {label}
    </span>
  );
}

function ChiLabel({
  cung,
  isActive,
}: {
  readonly cung: CungView;
  readonly isActive: boolean;
}): ReactElement {
  const { left, top, transform } = centerAnchorLabel(cung.index);
  return (
    <span
      className={cn(
        'pointer-events-none absolute z-20 bg-night px-0.5 text-2xs leading-3.5',
        isActive ? 'font-bold text-dawn' : 'font-semibold text-day-soft',
      )}
      style={{ left, top, transform }}
    >
      {cung.chi}
    </span>
  );
}

function BoardLines({
  highlights,
  lineStyle,
}: {
  readonly highlights: BoardHighlights;
  readonly lineStyle: LineStyle;
}): ReactElement {
  const { xungChieu } = highlights;
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 z-15 h-full w-full"
      preserveAspectRatio="none"
      viewBox={`0 0 ${BOARD_SIZE} ${BOARD_SIZE}`}
    >
      {highlights.tamHopEdges.map(({ from, to }) => (
        <line
          key={`${from.x},${from.y}-${to.x},${to.y}`}
          className={CHART_LINE_CLASS.tamHop}
          {...lineStyle}
          x1={from.x}
          x2={to.x}
          y1={from.y}
          y2={to.y}
        />
      ))}
      <line
        className={CHART_LINE_CLASS.xungChieu}
        {...lineStyle}
        x1={xungChieu.from.x}
        x2={xungChieu.to.x}
        y1={xungChieu.from.y}
        y2={xungChieu.to.y}
      />
    </svg>
  );
}

interface FullBoardProps extends LaSoBoardProps {
  readonly register: RegisterCungButton;
  readonly density: BoardDensity;
  readonly scale: number;
  readonly hoveredIndex: number | null;
  readonly onHover: (cungIndex: number | null) => void;
}

function FullBoard({
  chart,
  selectedIndex,
  onSelect,
  density,
  scale,
  hoveredIndex,
  onHover,
  register,
}: FullBoardProps): ReactElement {
  const focusedIndex = hoveredIndex ?? selectedIndex;
  const highlights = boardHighlights(chart, focusedIndex);
  const isSpotlight = hoveredIndex !== null;
  const isLit = (index: number): boolean => index === focusedIndex || highlights.related.has(index);

  return (
    <div
      className={cn('relative mx-auto grid', CHART_RULE_CLASS.fill)}
      style={{
        width: FULL_BOARD_WIDTH,
        zoom: scale,
        gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${BOARD_SIZE}, minmax(${FULL_BOARD_MIN_ROW_HEIGHT}px, 1fr))`,
      }}
    >
      {chart.cungs.map((cung) => (
        <div key={cung.index} className="min-w-0 bg-night" style={gridPlacement(cung)}>
          <CungCard
            buttonRef={register(cung.index)}
            cung={cungForDensity(cung, density)}
            sizingCung={density === BoardDensity.Key ? cung : undefined}
            isFocused={isSpotlight && cung.index === focusedIndex}
            isRelated={isSpotlight && highlights.related.has(cung.index)}
            isSelected={cung.index === selectedIndex}
            onFocusCung={onHover}
            onSelect={onSelect}
          />
        </div>
      ))}

      <div className="min-w-0" style={CENTER_AREA}>
        <ThienBan meta={chart.meta} />
      </div>

      <BlockLabel label="Tuần" pair={highlights.tuan} />
      <BlockLabel label="Triệt" pair={highlights.triet} />

      {chart.cungs.map((cung) => (
        <ChiLabel key={cung.index} cung={cung} isActive={isLit(cung.index)} />
      ))}

      <BoardLines highlights={highlights} lineStyle={FULL_LINE_STYLE} />
    </div>
  );
}

function CompactBoard({
  chart,
  selectedIndex,
  onSelect,
  register,
}: LaSoBoardProps & { readonly register: RegisterCungButton }): ReactElement {
  const highlights = boardHighlights(chart, selectedIndex);

  return (
    <div className="flex flex-col gap-4">
      <div
        className={cn(
          'relative grid grid-cols-4 grid-rows-4 gap-px border',
          CHART_RULE_CLASS.border,
          CHART_RULE_CLASS.fill,
        )}
      >
        {chart.cungs.map((cung) => (
          <div key={cung.index} className="min-w-0 bg-night" style={gridPlacement(cung)}>
            <CompactCungCell
              buttonRef={register(cung.index)}
              cung={cung}
              isPicked={cung.index === selectedIndex}
              isRelated={highlights.related.has(cung.index)}
              onSelect={onSelect}
            />
          </div>
        ))}

        <div className="flex items-center justify-center bg-night" style={CENTER_AREA}>
          <Orbit points={ORBIT_POINTS} className="size-3/4 text-gold/60" />
        </div>

        <BlockLabel label="Tuần" pair={highlights.tuan} />
        <BlockLabel label="Triệt" pair={highlights.triet} />

        <BoardLines highlights={highlights} lineStyle={COMPACT_LINE_STYLE} />
      </div>

      <ThienBan meta={chart.meta} />
    </div>
  );
}

function useCungButtons(boardRef: Ref<LaSoBoardHandle> | undefined): {
  readonly register: RegisterCungButton;
  readonly handleKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
} {
  const buttons = useRef(new Map<number, HTMLButtonElement>());

  const register: RegisterCungButton = (cungIndex) => (button) => {
    if (button === null) buttons.current.delete(cungIndex);
    else buttons.current.set(cungIndex, button);
  };

  useImperativeHandle(boardRef, () => ({
    focusCung: (index) => buttons.current.get(index)?.focus(),
  }));

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (!isBoardKey(event.key)) return;
    const from = [...buttons.current].find(([, button]) => button === event.target)?.[0];
    if (from === undefined) return;
    event.preventDefault();
    buttons.current.get(cungIndexInDirection(from, event.key))?.focus();
  };

  return { register, handleKeyDown };
}

export function LaSoBoard({
  chart,
  selectedIndex,
  onSelect,
  boardRef,
}: LaSoBoardProps): ReactElement {
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [density, setDensity] = useBoardDensity();
  const { register, handleKeyDown } = useCungButtons(boardRef);
  const variant = width === null ? null : boardVariantFor(width);

  return (
    <div className="w-full" onKeyDown={handleKeyDown} ref={ref}>
      {width !== null && variant === BoardVariant.Full ? (
        <>
          <div className="flex justify-end pb-3">
            <BoardDensityToggle onChange={setDensity} value={density} />
          </div>
          <FullBoard
            chart={chart}
            density={density}
            hoveredIndex={hoveredIndex}
            onHover={setHoveredIndex}
            onSelect={onSelect}
            register={register}
            scale={boardScaleFor(width)}
            selectedIndex={selectedIndex}
          />
        </>
      ) : null}
      {variant === BoardVariant.Compact ? (
        <CompactBoard
          chart={chart}
          onSelect={onSelect}
          register={register}
          selectedIndex={selectedIndex}
        />
      ) : null}
      {variant === null ? null : <BoardLegend />}
    </div>
  );
}
