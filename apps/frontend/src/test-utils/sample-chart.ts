import type { CungName } from '@org/shared-tu-vi';
import { CalendarType, Gender, type BirthInput } from '@/features/la-so/birth-input';
import type { ChartView } from '@/features/la-so/chart-types';
import { toChartView } from '@/features/la-so/to-chart-view';

export const SAMPLE_BIRTH: BirthInput = {
  day: 12,
  month: 3,
  year: 1995,
  calendar: CalendarType.Solar,
  hour: 'Ngọ',
  gender: Gender.Male,
};

export const SAMPLE_VIEW_YEAR = 2026;

export const SAMPLE_CHART: ChartView = toChartView({
  ...SAMPLE_BIRTH,
  viewYear: SAMPLE_VIEW_YEAR,
});

export function indexOfCung(name: CungName): number {
  return SAMPLE_CHART.cungs.findIndex((cung) => cung.cungName === name);
}
