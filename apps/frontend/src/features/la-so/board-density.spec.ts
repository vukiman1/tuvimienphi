import { BoardDensity, KEY_PHU_TINH, cungForDensity } from '@/features/la-so/board-density';
import type { CungView } from '@/features/la-so/chart-types';
import { SAMPLE_CHART } from '@/test-utils/sample-chart';

function sideStarCount(cung: CungView): number {
  return cung.catTinh.length + cung.hungTinh.length;
}

function busiestCung(): CungView {
  return SAMPLE_CHART.cungs.reduce((busiest, cung) =>
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
