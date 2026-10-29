import { castNatal, type NatalChart } from '../cast-chart.js';
import { CHI_COUNT } from '../chi.js';
import { CHI } from '../lich/lunar-calendar.js';
import { Gender } from '../van-han.js';
import { buildMenhBrief, buildMenhLensBrief } from './build-menh-brief.js';

interface LaSoMau {
  readonly ten: string;
  readonly chart: NatalChart;
}

const LA_SO_MAU: readonly LaSoMau[] = [
  {
    ten: '1960-05-26 21h Nam',
    chart: castNatal({ solarDate: new Date(1960, 4, 26), hour: 21, gender: Gender.Nam }),
  },
  {
    ten: '1956-03-03 1h Nam',
    chart: castNatal({ solarDate: new Date(1956, 2, 3), hour: 1, gender: Gender.Nam }),
  },
  {
    ten: '1955-06-26 21h Nữ',
    chart: castNatal({ solarDate: new Date(1955, 5, 26), hour: 21, gender: Gender.Nu }),
  },
  {
    ten: '1955-12-09 7h Nữ',
    chart: castNatal({ solarDate: new Date(1955, 11, 9), hour: 7, gender: Gender.Nu }),
  },
];

const ANCHORS = Array.from({ length: CHI_COUNT }, (_, chiIndex) => chiIndex);

const MONTHS_PER_YEAR = 12;
const SAMPLE_FIRST_YEAR = 1940;
const SAMPLE_LAST_YEAR = 2010;
const SAMPLE_YEAR_STEP = 3;
const SAMPLE_MONTHS = Array.from({ length: MONTHS_PER_YEAR }, (_, monthIndex) => monthIndex);
const SAMPLE_DAYS = [3, 17] as const;
const SAMPLE_HOURS = [0, 6, 12, 18] as const;
const SAMPLE_GENDERS = [Gender.Nam, Gender.Nu] as const;
const MAX_NULL_RATE = 0.01;
const NULL_RATE_TIMEOUT_MS = 30_000;

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

describe('buildMenhLensBrief', () => {
  it.each(LA_SO_MAU)('anchored at Mệnh gives the Mệnh brief for $ten', ({ chart }) => {
    expect(buildMenhLensBrief(chart, chart.menhIndex)).toEqual(buildMenhBrief(chart));
  });

  it('anchored at Tài Bạch names that cung and its chi', () => {
    const [{ chart }] = LA_SO_MAU;
    const taiBachIndex = chart.cungs.findIndex((cung) => cung.name === 'Tài Bạch');
    const brief = buildMenhLensBrief(chart, taiBachIndex);

    expect({ cung: brief?.cung, chi: brief?.chi }).toEqual({
      cung: 'Tài Bạch',
      chi: CHI[taiBachIndex],
    });
  });

  it(
    'yields a brief for nearly every chart at every anchor',
    () => {
      const results = sampleCharts().flatMap((chart) =>
        ANCHORS.map((anchorIndex) => buildMenhLensBrief(chart, anchorIndex)),
      );
      const nullRate = results.filter((brief) => brief === null).length / results.length;

      expect(nullRate).toBeLessThan(MAX_NULL_RATE);
    },
    NULL_RATE_TIMEOUT_MS,
  );
});
