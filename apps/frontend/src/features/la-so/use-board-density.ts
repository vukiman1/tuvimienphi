import { useState } from 'react';
import { BoardDensity } from '@/features/la-so/board-density';

export const BOARD_DENSITY_STORAGE_KEY = 'la-so.board-density';

const DENSITY_VALUES: readonly string[] = Object.values(BoardDensity);

function isBoardDensity(value: string | null): value is BoardDensity {
  return value !== null && DENSITY_VALUES.includes(value);
}

function readStoredDensity(): BoardDensity {
  try {
    const stored = window.localStorage.getItem(BOARD_DENSITY_STORAGE_KEY);
    return isBoardDensity(stored) ? stored : BoardDensity.Key;
  } catch {
    return BoardDensity.Key;
  }
}

function writeStoredDensity(density: BoardDensity): void {
  try {
    window.localStorage.setItem(BOARD_DENSITY_STORAGE_KEY, density);
  } catch {
    return undefined;
  }
}

export function useBoardDensity(): readonly [BoardDensity, (density: BoardDensity) => void] {
  const [density, setDensity] = useState<BoardDensity>(readStoredDensity);

  function chooseDensity(next: BoardDensity): void {
    setDensity(next);
    writeStoredDensity(next);
  }

  return [density, chooseDensity];
}
