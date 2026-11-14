import { CHINH_TINH_NAMES, type Rating } from '@org/shared-tu-vi';
import type { ChartView } from '@/features/la-so/chart-types';

export function properChinhTinhName(upperCaseName: string): string {
  return CHINH_TINH_NAMES.find((name) => name.toUpperCase() === upperCaseName) ?? upperCaseName;
}

export function starRatings(chart: ChartView): ReadonlyMap<string, Rating> {
  const ratings = new Map<string, Rating>();
  for (const cung of chart.cungs) {
    for (const star of cung.chinhTinh) {
      if (star.rating) ratings.set(properChinhTinhName(star.name), star.rating);
    }
    for (const star of [...cung.catTinh, ...cung.hungTinh]) {
      if (star.rating) ratings.set(star.name, star.rating);
    }
  }
  return ratings;
}
