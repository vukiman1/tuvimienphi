import { BoardDensity, KEY_PHU_TINH, cungForDensity } from '@/features/la-so/board-density';
import { CalendarType, Gender } from '@/features/la-so/birth-input';
import type { CungView } from '@/features/la-so/chart-types';
import { toChartView } from '@/features/la-so/to-chart-view';

const CHART = toChartView({
  day: 12,
  month: 3,
  year: 1995,
  calendar: CalendarType.Solar,
  hour: 'Ngọ',
  gender: Gender.Male,
  viewYear: 2026,
});

function sideStarCount(cung: CungView): number {
  return cung.catTinh.length + cung.hungTinh.length;
}

function busiestCung(): CungView {
  return CHART.cungs.reduce((busiest, cung) =>
    sideStarCount(cung) > sideStarCount(busiest) ? cung : busiest,
  );
}

describe('cungForDensity', () => {
  it('keeps chính tinh and key stars in Gọn', () => {
    const cung = busiestCung();
    const slim = cungForDensity(cung, BoardDensity.Key);
    const remaining = [...slim.catTinh, ...slim.hungTinh, ...slim.luuTinh, ...slim.daiVanTinh];

    expect(sideStarCount(slim)).toBeLessThan(sideStarCount(cung));
    expect(remaining.every((star) => KEY_PHU_TINH.has(star.name))).toBe(true);
    expect(slim.chinhTinh).toBe(cung.chinhTinh);
  });

  it('keeps every star in Đủ sao', () => {
    const cung = busiestCung();

    expect(cungForDensity(cung, BoardDensity.All)).toBe(cung);
  });
});
