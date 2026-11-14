import { CUNG_GRID_POSITIONS } from '@/features/la-so/board-layout';

export enum BoardKey {
  Up = 'ArrowUp',
  Down = 'ArrowDown',
  Left = 'ArrowLeft',
  Right = 'ArrowRight',
}

interface GridStep {
  readonly row: number;
  readonly column: number;
}

const GRID_STEP: Readonly<Record<BoardKey, GridStep>> = {
  [BoardKey.Up]: { row: -1, column: 0 },
  [BoardKey.Down]: { row: 1, column: 0 },
  [BoardKey.Left]: { row: 0, column: -1 },
  [BoardKey.Right]: { row: 0, column: 1 },
};

const CUNG_COUNT = CUNG_GRID_POSITIONS.length;

export function isBoardKey(key: string): key is BoardKey {
  return Object.values<string>(BoardKey).includes(key);
}

export function cungIndexInDirection(from: number, key: BoardKey): number {
  const { row, column } = CUNG_GRID_POSITIONS[from];
  const step = GRID_STEP[key];
  const target = CUNG_GRID_POSITIONS.findIndex(
    (position) => position.row === row + step.row && position.column === column + step.column,
  );
  return target === -1 ? from : target;
}

export function ringNeighbour(from: number, step: 1 | -1): number {
  return (from + step + CUNG_COUNT) % CUNG_COUNT;
}
