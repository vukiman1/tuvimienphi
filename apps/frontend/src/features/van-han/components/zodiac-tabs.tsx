import { useRef, type KeyboardEvent, type MouseEvent, type ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { FOCUS_RING_CLASS } from '@/design-system';
import { vanHanZodiacPath } from '@/features/van-han/van-han-paths';
import { ZODIAC_CHI, type ZodiacChi } from '@/lib/zodiac-icons';
import { cn } from '@/lib/utils';
import {
  PICKED_ZODIAC_TILE_CLASS,
  ZODIAC_GRID_CLASS,
  ZODIAC_ROW_LABEL,
  ZODIAC_TILE_CLASS,
  ZodiacTileFace,
} from './zodiac-row';
import { ZODIAC_PANEL_ID, zodiacTabId } from './zodiac-tab-ids';

const TAB_SELECTOR = '[role="tab"]';
const PRIMARY_BUTTON = 0;
const FIRST_TAB_KEY = 'Home';
const LAST_TAB_KEY = 'End';
const STEP_BY_KEY: Readonly<Partial<Record<string, number>>> = {
  ArrowRight: 1,
  ArrowLeft: -1,
};

function hasCommandModifier(event: KeyboardEvent | MouseEvent): boolean {
  return event.metaKey || event.ctrlKey || event.altKey;
}

function isPlainClick(event: MouseEvent): boolean {
  return event.button === PRIMARY_BUTTON && !event.shiftKey && !hasCommandModifier(event);
}

function tabIndexAfterKey(key: string, currentIndex: number): number | undefined {
  if (key === FIRST_TAB_KEY) return 0;
  if (key === LAST_TAB_KEY) return ZODIAC_CHI.length - 1;
  const step = STEP_BY_KEY[key];
  if (step === undefined) return undefined;
  return (currentIndex + step + ZODIAC_CHI.length) % ZODIAC_CHI.length;
}

interface ZodiacTabsProps {
  readonly selectedChi: ZodiacChi;
  readonly onSelect: (chi: ZodiacChi) => void;
}

export function ZodiacTabs({ selectedChi, onSelect }: ZodiacTabsProps): ReactElement {
  const tablistRef = useRef<HTMLDivElement>(null);

  function selectOnPlainClick(event: MouseEvent, chi: ZodiacChi): void {
    if (!isPlainClick(event)) return;
    event.preventDefault();
    onSelect(chi);
  }

  function selectOnArrowKey(event: KeyboardEvent, chiIndex: number): void {
    if (hasCommandModifier(event)) return;
    const nextIndex = tabIndexAfterKey(event.key, chiIndex);
    if (nextIndex === undefined) return;
    event.preventDefault();
    onSelect(ZODIAC_CHI[nextIndex].chi);
    tablistRef.current?.querySelectorAll<HTMLElement>(TAB_SELECTOR).item(nextIndex).focus();
  }

  return (
    <div
      aria-label={ZODIAC_ROW_LABEL}
      className={ZODIAC_GRID_CLASS}
      ref={tablistRef}
      role="tablist"
    >
      {ZODIAC_CHI.map((entry, chiIndex) => {
        const isSelected = entry.chi === selectedChi;
        return (
          <Link
            key={entry.chi}
            aria-controls={ZODIAC_PANEL_ID}
            aria-selected={isSelected}
            className={cn(
              ZODIAC_TILE_CLASS,
              FOCUS_RING_CLASS,
              isSelected && PICKED_ZODIAC_TILE_CLASS,
            )}
            id={zodiacTabId(entry.chi)}
            onClick={(event) => selectOnPlainClick(event, entry.chi)}
            onKeyDown={(event) => selectOnArrowKey(event, chiIndex)}
            role="tab"
            tabIndex={isSelected ? 0 : -1}
            to={vanHanZodiacPath(entry.chi)}
          >
            <ZodiacTileFace chi={entry.chi} chiIndex={chiIndex} />
          </Link>
        );
      })}
    </div>
  );
}
