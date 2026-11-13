import { convertSolarToLunar } from '@org/shared-tu-vi';
import {
  buildCalendarDays,
  CALENDAR_CELL_COUNT,
  isMungMot,
  isSpecialLunarDay,
  type CalendarDayContext,
} from './calendar-day';

const CONTEXT: CalendarDayContext = {
  viewYear: 2026,
  viewMonth: 8,
  selectedDate: new Date(2026, 7, 11),
  today: new Date(2026, 7, 11),
};
const DAYS_IN_AUGUST = 31;

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

describe('buildCalendarDays', () => {
  it('starts the grid on the Monday on or before the 1st', () => {
    const days = buildCalendarDays(CONTEXT);

    expect(days).toHaveLength(CALENDAR_CELL_COUNT);
    expect(dayKey(days[0].date)).toBe('2026-7-27');
    expect(dayKey(days[days.length - 1].date)).toBe('2026-9-6');
  });

  it('marks only the days of the shown month as in view', () => {
    const days = buildCalendarDays(CONTEXT);

    expect(days.filter((day) => day.isInViewMonth)).toHaveLength(DAYS_IN_AUGUST);
  });

  it('labels mùng 1 with its lunar month and other days with the day alone', () => {
    const days = buildCalendarDays(CONTEXT);
    const lunarDates = days.map((day) => convertSolarToLunar(day.date));
    const mungMotIndex = lunarDates.findIndex((lunar) => lunar.day === 1);
    const eleventh = days.find((day) => dayKey(day.date) === '2026-8-11');

    expect(mungMotIndex).toBeGreaterThanOrEqual(0);
    expect(days[mungMotIndex].lunarLabel).toBe(`1/${lunarDates[mungMotIndex].month}`);
    expect(eleventh?.lunarLabel).toBe('29');
  });

  it('flags exactly mùng 1 and rằm as special lunar days', () => {
    const days = buildCalendarDays(CONTEXT);

    for (const day of days) {
      expect(day.isSpecialLunarDay).toBe([1, 15].includes(convertSolarToLunar(day.date).day));
    }
    expect(days.filter((day) => day.isSpecialLunarDay).length).toBeGreaterThanOrEqual(2);
  });

  it('recognises mùng 1 and rằm by lunar day number', () => {
    expect([1, 2, 14, 15, 16, 30].map(isSpecialLunarDay)).toEqual([
      true,
      false,
      false,
      true,
      false,
      false,
    ]);
    expect([1, 15].map(isMungMot)).toEqual([true, false]);
  });

  it('marks today and the selected day independently', () => {
    const days = buildCalendarDays({ ...CONTEXT, selectedDate: new Date(2026, 7, 20) });

    expect(days.filter((day) => day.isToday).map((day) => dayKey(day.date))).toEqual(['2026-8-11']);
    expect(days.filter((day) => day.isSelected).map((day) => dayKey(day.date))).toEqual([
      '2026-8-20',
    ]);
  });
});
