import { CUNG_NAMES, type CungName } from '@org/shared-tu-vi';

export interface BoardCell {
  readonly name: CungName;
  readonly row: number;
  readonly column: number;
}

const PERIMETER_CLOCKWISE_FROM_TOP_LEFT = [
  { row: 1, column: 1 },
  { row: 1, column: 2 },
  { row: 1, column: 3 },
  { row: 1, column: 4 },
  { row: 2, column: 4 },
  { row: 3, column: 4 },
  { row: 4, column: 4 },
  { row: 4, column: 3 },
  { row: 4, column: 2 },
  { row: 4, column: 1 },
  { row: 3, column: 1 },
  { row: 2, column: 1 },
] as const;

export const BOARD_CELLS: readonly BoardCell[] = CUNG_NAMES.map((name, index) => ({
  name,
  ...PERIMETER_CLOCKWISE_FROM_TOP_LEFT[index],
}));

const MAP_PROGRESS_START = 0.1;
const MAP_PROGRESS_SPAN = 0.85;

export function activeStatementIndex(progress: number, statementCount: number): number {
  const steps = Math.min(1, Math.max(0, (progress - MAP_PROGRESS_START) / MAP_PROGRESS_SPAN));
  return Math.min(statementCount - 1, Math.floor(steps * statementCount));
}
