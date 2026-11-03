import { anLuuTinh } from '../an-luu-tinh.js';
import { applyViewYear, castNatal, type NatalChart } from '../cast-chart.js';
import { HOA_NAMES } from '../tu-hoa.js';
import { Gender, daiVanAt } from '../van-han.js';
import { viewYearPillar } from '../view-year.js';
import { DAI_VAN_CHU_DE } from './bang/van-han/dai-van-chu-de.js';
import {
  VanHanMucKey,
  VanHanTone,
  buildVanHanBrief,
  buildVanHanMucBriefs,
  vanHanYearOf,
  type VanHanMucBrief,
  type VanHanYear,
} from './build-van-han-brief.js';
import { Sac } from './luan-de.js';
import { theCuaChi } from './the-cung.js';

const CURRENT_YEAR = 2026;
const VIEW_YEAR = 2027;
const MAX_MUC_CLAIMS = 3;
const MIN_COVERAGE_RATE = 0.99;
const COVERAGE_TIMEOUT_MS = 60_000;

const SAMPLE_FIRST_YEAR = 1940;
const SAMPLE_LAST_YEAR = 2010;
const SAMPLE_YEAR_STEP = 3;
const SAMPLE_MONTHS = Array.from({ length: 12 }, (_, monthIndex) => monthIndex);
const SAMPLE_DAYS = [3, 17] as const;
const SAMPLE_HOURS = [0, 6, 12, 18] as const;
const SAMPLE_GENDERS = [Gender.Nam, Gender.Nu] as const;
const SAMPLE_VIEW_YEARS = [2026, 2027] as const;

const CHART_1960 = castNatal({ solarDate: new Date(1960, 4, 26), hour: 21, gender: Gender.Nam });

function sampleCharts(): NatalChart[] {
  const charts: NatalChart[] = [];
  for (let year = SAMPLE_FIRST_YEAR; year <= SAMPLE_LAST_YEAR; year += SAMPLE_YEAR_STEP) {
    for (const month of SAMPLE_MONTHS) {
      for (const day of SAMPLE_DAYS) {
        for (const hour of SAMPLE_HOURS) {
          for (const gender of SAMPLE_GENDERS) {
            charts.push(castNatal({ solarDate: new Date(year, month, day), hour, gender }));
          }
        }
      }
    }
  }
  return charts;
}

function yearOf(chart: NatalChart, viewYear: number): VanHanYear {
  const year = vanHanYearOf(chart, viewYear, CURRENT_YEAR);
  if (!year) throw new Error(`no vận hạn year for view year ${viewYear}`);
  return year;
}

function mucOf(briefs: readonly VanHanMucBrief[], key: VanHanMucKey): VanHanMucBrief | undefined {
  return briefs.find((brief) => brief.muc === key);
}

describe('vanHanYearOf', () => {
  it('has no year before the chart was born', () => {
    expect(vanHanYearOf(CHART_1960, CHART_1960.lunar.year - 1, CURRENT_YEAR)).toBeNull();
  });

  it('has no year before the first đại vận begins', () => {
    const [firstSpan] = CHART_1960.daiVan;
    const yearBeforeFirstSpan = CHART_1960.lunar.year + firstSpan.startAge - 2;

    expect(vanHanYearOf(CHART_1960, yearBeforeFirstSpan, CURRENT_YEAR)).toBeNull();
  });

  it('has no year past the twelfth đại vận', () => {
    const lastEndAge = Math.max(...CHART_1960.daiVan.map((span) => span.endAge));
    const yearAfterLastSpan = CHART_1960.lunar.year + lastEndAge;

    expect(vanHanYearOf(CHART_1960, yearAfterLastSpan, CURRENT_YEAR)).toBeNull();
  });

  it('looks back on a year before the current one', () => {
    expect(yearOf(CHART_1960, CURRENT_YEAR - 1).tone).toBe(VanHanTone.LookBack);
  });

  it('gives advice for the current year and the years after it', () => {
    expect(yearOf(CHART_1960, CURRENT_YEAR).tone).toBe(VanHanTone.Advice);
    expect(yearOf(CHART_1960, CURRENT_YEAR + 1).tone).toBe(VanHanTone.Advice);
  });

  it('places 2027 inside the đại vận and tiểu hạn the board shows for the 1960 chart', () => {
    const year = yearOf(CHART_1960, VIEW_YEAR);
    const daiVan = daiVanAt(CHART_1960.daiVan, 68);

    expect(year).toMatchObject({
      tuoi: 68,
      namCanChi: 'Đinh Mùi',
      tieuHan: applyViewYear(CHART_1960, VIEW_YEAR).tieuHan,
      daiVan,
      namThuTrongVan: 68 - (daiVan?.startAge ?? 0) + 1,
    });
  });

  it('dates the next đại vận from the age it starts at', () => {
    const year = yearOf(CHART_1960, VIEW_YEAR);
    const startAge = year.daiVanKeTiep?.startAge ?? 0;

    expect(year.namBatDauVanKeTiep).toBe(VIEW_YEAR + (startAge - year.tuoi));
    expect(year.daiVanKeTiep?.startAge).toBe(year.daiVan.endAge + 1);
  });

  it('has no next đại vận inside the twelfth one', () => {
    const lastSpan = CHART_1960.daiVan.reduce((latest, span) =>
      span.startAge > latest.startAge ? span : latest,
    );
    const year = yearOf(CHART_1960, CHART_1960.lunar.year + lastSpan.startAge - 1);

    expect(year).toMatchObject({
      daiVanKeTiep: null,
      cungDaiVanKeTiep: null,
      namBatDauVanKeTiep: null,
    });
  });
});

describe('buildVanHanBrief', () => {
  it('reads the đại vận cung and carries its theme', () => {
    const year = yearOf(CHART_1960, VIEW_YEAR);
    const brief = buildVanHanBrief(CHART_1960, year);

    expect(brief?.cung).toBe(year.cungDaiVan);
    expect(brief?.vanHan.chuDeVan).toBe(DAI_VAN_CHU_DE[year.cungDaiVan]);
    expect(brief?.vanHan.daiVanTuoi).toBe(`${year.daiVan.startAge}–${year.daiVan.endAge} tuổi`);
  });
});

describe('buildVanHanMucBriefs', () => {
  const year = yearOf(CHART_1960, VIEW_YEAR);
  const briefs = buildVanHanMucBriefs(CHART_1960, year);

  it.each([
    [VanHanMucKey.DiemSang, Sac.Thuan],
    [VanHanMucKey.DieuCanGiu, Sac.Nghich],
  ])('keeps %s to claims of one direction, at most three', (key, sac) => {
    const brief = mucOf(briefs, key);

    expect(brief?.luan.every((claim) => claim.sac === sac)).toBe(true);
    expect(brief?.luan.length).toBeLessThanOrEqual(MAX_MUC_CLAIMS);
  });

  it('anchors both year mục on the tiểu hạn cung', () => {
    expect(briefs.map((brief) => brief.cung)).toEqual([year.cungTieuHan, year.cungTieuHan]);
  });

  it('lists every star behind a claim, so the article may name it', () => {
    for (const brief of briefs) {
      const listed = new Set<string>(
        [...brief.chinhTinh, ...brief.catTinh, ...brief.hungTinh].map((star) => star.ten),
      );
      for (const star of brief.luan.flatMap((claim) => claim.do)) {
        expect([brief.muc, star, listed.has(star)]).toEqual([brief.muc, star, true]);
      }
    }
  });

  it('places each lưu tinh by its position from the tiểu hạn cung', () => {
    const luuTinh = new Map<string, number>(
      anLuuTinh(viewYearPillar(VIEW_YEAR)).map((placement) => [placement.name, placement.chiIndex]),
    );
    for (const brief of briefs) {
      for (const star of [...brief.catTinh, ...brief.hungTinh]) {
        const chiIndex = luuTinh.get(star.ten);
        if (chiIndex === undefined) continue;
        expect([star.ten, star.the]).toEqual([star.ten, theCuaChi(year.tieuHan, chiIndex)]);
      }
    }
  });

  it('ranks the year’s own stars ahead of the natal lens', () => {
    const yearStars = new Set<string>([
      ...HOA_NAMES,
      ...anLuuTinh(viewYearPillar(VIEW_YEAR))
        .filter((placement) => theCuaChi(year.tieuHan, placement.chiIndex) !== null)
        .map((placement) => placement.name),
    ]);
    for (const brief of briefs) {
      const isYearClaim = brief.luan.map((claim) => claim.do.every((star) => yearStars.has(star)));
      const firstLensIndex = isYearClaim.indexOf(false);
      const lastYearIndex = isYearClaim.lastIndexOf(true);

      if (firstLensIndex >= 0)
        expect([brief.muc, lastYearIndex < firstLensIndex]).toEqual([brief.muc, true]);
    }
  });

  it(
    'writes both year mục for nearly every chart',
    () => {
      const years = sampleCharts().flatMap((chart) =>
        SAMPLE_VIEW_YEARS.flatMap((viewYear) => {
          const sampleYear = vanHanYearOf(chart, viewYear, CURRENT_YEAR);
          return sampleYear ? [{ chart, sampleYear }] : [];
        }),
      );
      const covered = years.filter(({ chart, sampleYear }) => {
        const keys = buildVanHanMucBriefs(chart, sampleYear).map((brief) => brief.muc);
        return keys.includes(VanHanMucKey.DiemSang) && keys.includes(VanHanMucKey.DieuCanGiu);
      });
      const coverageRate = covered.length / years.length;
      console.info(`vận hạn mục coverage: ${covered.length}/${years.length}`);

      expect(coverageRate).toBeGreaterThanOrEqual(MIN_COVERAGE_RATE);
    },
    COVERAGE_TIMEOUT_MS,
  );
});
