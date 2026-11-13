import type { ReactElement } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FOCUS_RING_CLASS } from '@/design-system';
import { buildCalendarDays, type CalendarDay } from '@/features/ngay-tot/calendar-day';
import { cn } from '@/lib/utils';

const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] as const;
const SUNDAY_LABEL = 'CN';
const NAV_BUTTON_CLASS =
  'flex size-11 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:bg-day-200';

const DAY_CELL_CLASS = {
  inMonth: 'bg-day-200',
  selected: 'bg-gold inset-ring-2 inset-ring-ink',
  today: 'inset-ring-1 inset-ring-ink',
} as const;

interface MonthCalendarProps {
  readonly viewYear: number;
  readonly viewMonth: number;
  readonly selectedDate: Date;
  readonly onSelectDate: (date: Date) => void;
  readonly onStepMonth: (delta: -1 | 1) => void;
  readonly onGoToday: () => void;
}

function solarTextClass(day: CalendarDay): string {
  if (day.isSelected) return 'text-ink';
  if (!day.isInViewMonth) return 'text-ink-soft';
  if (day.isSunday) return 'text-danger';
  return 'text-ink';
}

function lunarTextClass(day: CalendarDay): string {
  if (day.isSpecialLunarDay && day.isInViewMonth) return 'font-bold text-dusk';
  if (day.isSelected) return 'text-ink';
  return 'text-ink-soft';
}

function DayButton({
  day,
  onSelect,
}: {
  readonly day: CalendarDay;
  readonly onSelect: (date: Date) => void;
}): ReactElement {
  const isPlain = !day.isSelected && !day.isToday;

  return (
    <button
      aria-current={day.isToday ? 'date' : undefined}
      aria-pressed={day.isSelected}
      onClick={() => onSelect(day.date)}
      type="button"
      className={cn(
        'mx-auto flex aspect-square w-full max-w-12 flex-col items-center justify-center rounded-xl transition-colors',
        FOCUS_RING_CLASS,
        day.isInViewMonth && DAY_CELL_CLASS.inMonth,
        day.isToday && !day.isSelected && DAY_CELL_CLASS.today,
        day.isSelected && DAY_CELL_CLASS.selected,
        isPlain && 'hover:ring-1 hover:ring-ink/40 hover:ring-inset',
      )}
    >
      <span className={cn('text-sm leading-5 font-semibold', solarTextClass(day))}>
        {day.date.getDate()}
      </span>
      <span className={cn('text-2xs leading-4', lunarTextClass(day))}>{day.lunarLabel}</span>
    </button>
  );
}

export function MonthCalendar({
  viewYear,
  viewMonth,
  selectedDate,
  onSelectDate,
  onStepMonth,
  onGoToday,
}: MonthCalendarProps): ReactElement {
  const days = buildCalendarDays({ viewYear, viewMonth, selectedDate, today: new Date() });

  return (
    <div className="flex h-full flex-col rounded-2xl border border-ink/15 bg-day p-2 sm:p-3 md:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-center font-display text-xl font-extrabold text-ink sm:text-left">
          Tháng {viewMonth}, {viewYear}
        </p>
        <div className="flex items-center justify-center gap-2">
          <button
            aria-label="Tháng trước"
            className={cn(NAV_BUTTON_CLASS, FOCUS_RING_CLASS)}
            onClick={() => onStepMonth(-1)}
            type="button"
          >
            <ChevronLeft aria-hidden className="size-4" />
          </button>
          <button
            className={cn(
              'min-h-11 rounded-full border border-ink/15 px-4 text-xs font-semibold text-ink transition-colors hover:border-gold',
              FOCUS_RING_CLASS,
            )}
            onClick={onGoToday}
            type="button"
          >
            Hôm nay
          </button>
          <button
            aria-label="Tháng sau"
            className={cn(NAV_BUTTON_CLASS, FOCUS_RING_CLASS)}
            onClick={() => onStepMonth(1)}
            type="button"
          >
            <ChevronRight aria-hidden className="size-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid flex-1 grid-cols-7 content-between gap-0.5 sm:gap-1">
        {WEEKDAY_LABELS.map((label) => (
          <p
            key={label}
            className={cn(
              'pb-1 text-center text-xs font-semibold',
              label === SUNDAY_LABEL ? 'text-danger' : 'text-ink-soft',
            )}
          >
            {label}
          </p>
        ))}

        {days.map((day) => (
          <DayButton key={day.date.toISOString()} day={day} onSelect={onSelectDate} />
        ))}
      </div>
    </div>
  );
}
