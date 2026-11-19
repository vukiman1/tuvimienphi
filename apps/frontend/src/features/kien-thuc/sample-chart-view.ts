import { BIRTH_HOURS, CalendarType, Gender } from '@org/shared-contracts';
import type { BirthInput } from '@org/shared-contracts';
import { KIEN_THUC_SAMPLE_BIRTH } from '@org/shared-kien-thuc';
import type { ChartView, CungView } from '@/features/la-so/chart-types';
import { toChartView } from '@/features/la-so/to-chart-view';

export const SAMPLE_CHART_LESSON_SLUG = 'doc-la-so-cua-chinh-ban';
export const SAMPLE_VIEW_YEAR = 2027;

function sampleBirthHourKey(): BirthInput['hour'] {
  const hour = BIRTH_HOURS.find((entry) => entry.hour === KIEN_THUC_SAMPLE_BIRTH.hour);
  if (!hour) {
    throw new Error(`No birth hour starts at ${KIEN_THUC_SAMPLE_BIRTH.hour}h for the sample chart`);
  }
  return hour.key;
}

export function sampleBirthInput(): BirthInput {
  return {
    day: KIEN_THUC_SAMPLE_BIRTH.day,
    month: KIEN_THUC_SAMPLE_BIRTH.month,
    year: KIEN_THUC_SAMPLE_BIRTH.year,
    calendar: CalendarType.Solar,
    hour: sampleBirthHourKey(),
    gender: Gender.Male,
  };
}

function withoutYearlyLayer(cung: CungView): CungView {
  return { ...cung, luuTinh: [], daiVanTinh: [], luuNien: '', isTieuHan: false };
}

export function sampleChartView(): ChartView {
  const view = toChartView({ ...sampleBirthInput(), viewYear: SAMPLE_VIEW_YEAR });
  return { ...view, cungs: view.cungs.map(withoutYearlyLayer) };
}

export function sampleChartCaption(): string {
  const { day, month, year, hour, gender } = sampleBirthInput();
  return `Lá số mẫu: ${gender}, sinh ngày ${day}/${month}/${year} dương lịch, giờ ${hour}`;
}
