import { castNatal, type NatalChart } from '../cast-chart.js';
import { Gender } from '../van-han.js';
import { BANG_QUAN_LOC } from './bang/quan-loc/bang-quan-loc.js';
import { buildCungBrief } from './build-cung-brief.js';
import { buildMenhBrief } from './build-menh-brief.js';
import { Sac, type LuanDe } from './luan-de.js';
import { quickCungLuan } from './quick-cung-luan.js';

const BASELINE_CHART: NatalChart = castNatal({
  solarDate: new Date(1995, 2, 12),
  hour: 12,
  gender: Gender.Nam,
});

const VO_CHINH_DIEU_MENH_CHART: NatalChart = castNatal({
  solarDate: new Date(1990, 0, 1),
  hour: 3,
  gender: Gender.Nam,
});

function firstClaimOf(luan: readonly LuanDe[], sac: Sac): LuanDe | undefined {
  return luan.find((claim) => claim.sac === sac);
}

describe('quickCungLuan', () => {
  it('picks the strongest thuận and nghịch claim of the cung brief', () => {
    const brief = buildCungBrief(BASELINE_CHART, BANG_QUAN_LOC);
    const result = quickCungLuan(BASELINE_CHART, 'Quan Lộc');

    expect(result?.thuan).toEqual(firstClaimOf(brief?.luan ?? [], Sac.Thuan));
    expect(result?.nghich).toEqual(firstClaimOf(brief?.luan ?? [], Sac.Nghich));
  });

  it('reads Mệnh through the Mệnh brief', () => {
    const brief = buildMenhBrief(BASELINE_CHART);

    expect(quickCungLuan(BASELINE_CHART, 'Mệnh')?.thuan).toEqual(
      firstClaimOf(brief?.luan ?? [], Sac.Thuan),
    );
  });

  it('still reads a vô chính diệu Mệnh', () => {
    expect(buildMenhBrief(VO_CHINH_DIEU_MENH_CHART)?.laVoChinhDieu).toBe(true);
    expect(quickCungLuan(VO_CHINH_DIEU_MENH_CHART, 'Mệnh')).not.toBeNull();
  });

  it('has nothing to say for a cung without a table', () => {
    expect(quickCungLuan(BASELINE_CHART, 'Thiên Di')).toBeNull();
  });
});
