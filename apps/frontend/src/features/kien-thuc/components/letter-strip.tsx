import type { ReactElement } from 'react';
import { FOCUS_RING_CLASS } from '@/design-system';
import { cn } from '@/lib/utils';
import { letterAnchor } from '../glossary-order';

const LETTER_STRIP_LABEL = 'Theo chữ cái';

interface LetterStripProps {
  readonly letters: readonly string[];
}

export function LetterStrip({ letters }: LetterStripProps): ReactElement {
  return (
    <nav aria-label={LETTER_STRIP_LABEL}>
      <ul className="flex flex-wrap gap-2">
        {letters.map((letter) => (
          <li key={letter}>
            <a
              href={`#${letterAnchor(letter)}`}
              className={cn(
                'flex size-11 items-center justify-center rounded-xl border border-ink/15 bg-day font-bold text-ink no-underline hover:inset-ring-2 hover:inset-ring-ink',
                FOCUS_RING_CLASS,
              )}
            >
              {letter}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
