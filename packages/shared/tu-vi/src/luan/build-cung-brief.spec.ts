import { castNatal, type NatalChart } from '../cast-chart.js';
import { CHI } from '../lich/lunar-calendar.js';
import { Gender } from '../van-han.js';
import { cachCucTai } from './bang/cach-cuc.js';
import { BANG_TAI_BACH } from './bang/tai-bach/bang-tai-bach.js';
import { buildCungBrief, cungIndexOf } from './build-cung-brief.js';

const GIO_QUET = [1, 7, 13, 19];

const THIEN_LUONG: NatalChart = castNatal({
  solarDate: new Date(1953, 0, 25),
  hour: 21,
  gender: Gender.Nam,
});

function quetLaSo(): NatalChart[] {
  const charts: NatalChart[] = [];
  for (const year of [1968, 1985, 1994, 2001]) {
    for (let month = 0; month < 12; month += 1) {
      for (const day of [3, 11, 19, 27]) {
        for (const hour of GIO_QUET) {
          for (const gender of [Gender.Nam, Gender.Nu]) {
            charts.push(castNatal({ solarDate: new Date(year, month, day), hour, gender }));
          }
        }
      }
    }
  }
  return charts;
}

describe('buildCungBrief', () => {
  it('bỏ hẳn mệnh đề cách cục khi bảng tắt dungCachCuc', () => {
    const cachCuc = new Set(
      cachCucTai(THIEN_LUONG, cungIndexOf(THIEN_LUONG, 'Tài Bạch')).flatMap((cach) =>
        cach.luan.map((de) => de.y),
      ),
    );

    const brief = buildCungBrief(THIEN_LUONG, { ...BANG_TAI_BACH, dungCachCuc: false });

    expect(cachCuc.size).toBeGreaterThan(0);
    expect(buildCungBrief(THIEN_LUONG, BANG_TAI_BACH)?.luan.some((de) => cachCuc.has(de.y))).toBe(
      true,
    );
    expect(brief?.luan.filter((de) => cachCuc.has(de.y))).toEqual([]);
  });

  it('mệnh đề Hóa Kỵ lấy lời từ bảng của chính cung đó', () => {
    const bang = { ...BANG_TAI_BACH, hoaKy: { y: 'lời Hóa Kỵ thử', tuKhoa: ['thử'] } };

    expect(
      quetLaSo().some((chart) =>
        buildCungBrief(chart, bang)?.luan.some((de) => de.y === 'lời Hóa Kỵ thử'),
      ),
    ).toBe(true);
  });

  it('cungIndexOf ra đúng chi của cung trên lá số đã biết', () => {
    expect(CHI[cungIndexOf(THIEN_LUONG, 'Tài Bạch')]).toBe('Tuất');
    expect(CHI[cungIndexOf(THIEN_LUONG, 'Quan Lộc')]).toBe('Ngọ');
  });
});
