import { convertSolarToLunar } from '@org/shared-tu-vi';

export const CALENDAR_CELL_COUNT = 42;

const DAYS_PER_WEEK = 7;
const SUNDAY = 0;
const MUNG_MOT = 1;
const RAM = 15;

export function isMungMot(lunarDay: number): boolean {
  return lunarDay === MUNG_MOT;
}

export function isSpecialLunarDay(lunarDay: number): boolean {
  return lunarDay === MUNG_MOT || lunarDay === RAM;
}

export interface CalendarDayContext {
  readonly viewYear: number;
  readonly viewMonth: number;
  readonly selectedDate: Date;
  readonly today: Date;
}

export interface CalendarDay {
  readonly date: Date;
  readonly isInViewMonth: boolean;
  readonly isToday: boolean;
  readonly isSelected: boolean;
  readonly isSunday: boolean;
  readonly isSpecialLunarDay: boolean;
  readonly lunarLabel: string;
}

function buildCalendarDates(year: number, month: number): readonly Date[] {
  const firstOfMonth = new Date(year, month - 1, 1);
  const daysSinceMonday = (firstOfMonth.getDay() + DAYS_PER_WEEK - 1) % DAYS_PER_WEEK;
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

export function buildCalendarDays({
  viewYear,
  viewMonth,
  selectedDate,
  today,
}: CalendarDayContext): readonly CalendarDay[] {
  return buildCalendarDates(viewYear, viewMonth).map((date) => {
    const lunar = convertSolarToLunar(date);
    return {
      date,
      isInViewMonth: date.getMonth() + 1 === viewMonth && date.getFullYear() === viewYear,
      isToday: isSameDay(date, today),
      isSelected: isSameDay(date, selectedDate),
      isSunday: date.getDay() === SUNDAY,
      isSpecialLunarDay: isSpecialLunarDay(lunar.day),
      lunarLabel: isMungMot(lunar.day) ? `${lunar.day}/${lunar.month}` : `${lunar.day}`,
    };
  });
}
