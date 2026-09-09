import { BIRTH_HOURS, CalendarType, type BirthHour, type BirthInput } from '@org/shared-contracts';
import { castChart, type TuViChart } from './cast-chart.js';
import { convertLunarToSolar } from './lich/lunar-calendar.js';
import { Gender } from './van-han.js';

export interface ChartFromBirth {
  readonly chart: TuViChart;
  /** Ngày dương thực sự lập lá số — khác ngày người dùng nhập khi họ nhập lịch âm. */
  readonly solarDate: Date;
  readonly birthHour: BirthHour;
}

export class UnknownBirthHourError extends Error {
  constructor(readonly hour: string) {
    super(`giờ sinh không có trong bảng: ${hour}`);
    this.name = 'UnknownBirthHourError';
  }
}

/**
 * Đường duy nhất đi từ thông tin người dùng nhập tới lá số. Frontend và backend đều phải đi qua đây:
 * hai bên dựng lá số khác nhau cho cùng một `birthKey` là đầu độc cache luận giải, vì bài được lưu
 * theo khoá đó chứ không theo người xem.
 *
 * Nhập lịch âm thì đổi sang dương trước — can chi NGÀY suy từ số ngày Julian của lịch dương, không
 * suy thẳng từ ngày âm được. Form chưa hỏi tháng nhuận nên hiểu là tháng thường.
 */
export function chartFromBirthInput(input: BirthInput, viewYear?: number): ChartFromBirth {
  const solarDate =
    input.calendar === CalendarType.Lunar
      ? convertLunarToSolar({
          day: input.day,
          month: input.month,
          year: input.year,
          isLeapMonth: false,
        })
      : new Date(input.year, input.month - 1, input.day);

  const birthHour = BIRTH_HOURS.find((entry) => entry.key === input.hour);
  if (!birthHour) {
    throw new UnknownBirthHourError(input.hour);
  }

  const chart = castChart({
    solarDate,
    hour: birthHour.hour,
    gender: input.gender === 'nam' ? Gender.Nam : Gender.Nu,
    viewYear,
  });

  return { chart, solarDate, birthHour };
}
