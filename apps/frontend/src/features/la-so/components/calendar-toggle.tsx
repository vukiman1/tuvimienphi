import type { ReactElement } from 'react';
import { CALENDAR_LABELS, CalendarType } from '@/features/la-so/birth-input';
import { cn } from '@/lib/utils';

const CALENDAR_ORDER = [CalendarType.Solar, CalendarType.Lunar] as const;

const CHOICE_CLASS =
  'cursor-pointer rounded-full px-4 py-2 text-center text-sm font-semibold transition-colors motion-reduce:transition-none has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink';

interface CalendarToggleProps {
  readonly value: CalendarType;
  readonly onChange: (value: CalendarType) => void;
}

export function CalendarToggle({ value, onChange }: CalendarToggleProps): ReactElement {
  return (
    <fieldset className="grid w-full max-w-xs grid-cols-2 justify-self-center rounded-full border border-ink/15 bg-day-200 p-1">
      <legend className="sr-only">Loại lịch</legend>
      {CALENDAR_ORDER.map((calendar) => {
        const isChosen = value === calendar;
        return (
          <label
            key={calendar}
            className={cn(
              CHOICE_CLASS,
              isChosen ? 'bg-gold text-ink shadow-sm' : 'text-ink-soft hover:text-ink',
            )}
          >
            <input
              checked={isChosen}
              className="sr-only"
              name="calendar"
              onChange={() => onChange(calendar)}
              type="radio"
              value={calendar}
            />
            {CALENDAR_LABELS[calendar]} lịch
          </label>
        );
      })}
    </fieldset>
  );
}
