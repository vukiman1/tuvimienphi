import { ChevronLeft, ChevronRight } from 'lucide-react';
import { convertSolarToLunar } from '@/lib/lunar-calendar';

const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] as const;
const CALENDAR_CELL_COUNT = 42;
const NAV_BUTTON_CLASS =
  'flex size-7 items-center justify-center rounded-md border border-[#c9a15c]/60 text-primary transition-colors hover:bg-primary/10 outline-none focus-visible:ring-2 focus-visible:ring-ring/60';

interface MonthCalendarProps {
  readonly viewYear: number;
  readonly viewMonth: number;
  readonly selectedDate: Date;
  readonly onSelectDate: (date: Date) => void;
  readonly onStepMonth: (delta: -1 | 1) => void;
  readonly onGoToday: () => void;
}

function buildCalendarDates(year: number, month: number): readonly Date[] {
  const firstOfMonth = new Date(year, month - 1, 1);
  const daysSinceMonday = (firstOfMonth.getDay() + 6) % 7;
  return Array.from(
    { length: CALENDAR_CELL_COUNT },
    (_, index) => new Date(year, month - 1, 1 - daysSinceMonday + index),
  );
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function MonthCalendar({
  viewYear,
  viewMonth,
  selectedDate,
  onSelectDate,
  onStepMonth,
  onGoToday,
}: MonthCalendarProps) {
  const today = new Date();
  const dates = buildCalendarDates(viewYear, viewMonth);

  return (
    <div className="rounded-xl border border-[#c9a15c]/40 bg-card p-3 shadow-md md:p-4">
      <div className="flex items-center justify-between gap-2">
        <button
          aria-label="Tháng trước"
          className={NAV_BUTTON_CLASS}
          onClick={() => onStepMonth(-1)}
          type="button"
        >
          <ChevronLeft className="size-4" />
        </button>
        <p className="font-display text-base font-bold whitespace-nowrap text-primary md:text-lg">
          Tháng {viewMonth}, {viewYear}
        </p>
        <div className="flex items-center gap-2">
          <button
            className="rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            onClick={onGoToday}
            type="button"
          >
            Hôm nay
          </button>
          <button
            aria-label="Tháng sau"
            className={NAV_BUTTON_CLASS}
            onClick={() => onStepMonth(1)}
            type="button"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-0.5">
        {WEEKDAY_LABELS.map((label) => (
          <p
            key={label}
            className={`pb-1 text-center text-[0.65rem] font-semibold tracking-wide ${
              label === 'CN' ? 'text-destructive' : 'text-muted-foreground'
            }`}
          >
            {label}
          </p>
        ))}

        {dates.map((date) => {
          const lunar = convertSolarToLunar(date);
          const isInViewMonth =
            date.getMonth() + 1 === viewMonth && date.getFullYear() === viewYear;
          const isToday = isSameDay(date, today);
          const isSelected = isSameDay(date, selectedDate);
          const isSunday = date.getDay() === 0;
          const isSpecialLunarDay = lunar.day === 1 || lunar.day === 15;
          const lunarLabel = lunar.day === 1 ? `${lunar.day}/${lunar.month}` : `${lunar.day}`;

          const solarColor = isSelected
            ? 'text-[#1a1a1c]'
            : !isInViewMonth
              ? 'text-muted-foreground/40'
              : isSunday
                ? 'text-destructive'
                : 'text-foreground';
          const lunarColor = isSelected
            ? 'text-[#1a1a1c]/70'
            : !isInViewMonth
              ? 'text-muted-foreground/30'
              : isSpecialLunarDay
                ? 'font-semibold text-primary'
                : 'text-muted-foreground';

          return (
            <button
              key={date.toISOString()}
              aria-current={isToday ? 'date' : undefined}
              aria-pressed={isSelected}
              onClick={() => onSelectDate(date)}
              type="button"
              className={`flex flex-col items-center rounded-md py-1 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/60 ${
                isSelected
                  ? 'bg-gradient-to-br from-[#e8c987] to-[#b8894a] shadow-sm'
                  : `hover:bg-primary/10 ${isToday ? 'ring-1 ring-[#c9a15c]' : ''}`
              }`}
            >
              <span className={`text-sm font-medium ${solarColor}`}>{date.getDate()}</span>
              <span className={`text-[0.6rem] leading-tight ${lunarColor}`}>{lunarLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
