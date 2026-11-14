import type { Rating } from '@org/shared-tu-vi';
import type { ChartView } from '@/features/la-so/chart-types';

export function starRatings(chart: ChartView): ReadonlyMap<string, Rating> {
  const ratings = new Map<string, Rating>();
  for (const cung of chart.cungs) {
    for (const star of cung.chinhTinh) {
      if (star.rating) ratings.set(star.starName, star.rating);
    }
    for (const star of [...cung.catTinh, ...cung.hungTinh]) {
      if (star.rating) ratings.set(star.name, star.rating);
    }
  }
  return ratings;
}
