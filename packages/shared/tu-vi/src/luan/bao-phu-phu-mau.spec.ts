import { castNatal } from '../cast-chart.js';
import type { SaoName } from '../sao-names.js';
import { Gender } from '../van-han.js';
import { BANG_PHU_MAU } from './bang/phu-mau/bang-phu-mau.js';
import { buildCungBrief } from './build-cung-brief.js';
import { Sac } from './luan-de.js';

const GIO_QUET = [1, 7, 13, 19];

function quetLaSo(): ReturnType<typeof castNatal>[] {
  const charts = [];
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

describe('bảng luận cung Phụ Mẫu', () => {
  it('dựng được bài cho mọi lá số quét qua', () => {
    const thieu = quetLaSo().filter((chart) => buildCungBrief(chart, BANG_PHU_MAU) === null);

    expect(thieu).toHaveLength(0);
  });

  it('luan cuối vẫn giữ ít nhất một mệnh đề quy về chính tinh ở mỗi chiều thuận/nghịch', () => {
    const thieu = quetLaSo()
      .map((chart) => buildCungBrief(chart, BANG_PHU_MAU))
      .filter((brief): brief is NonNullable<typeof brief> => brief !== null)
      .filter((brief) => {
        const tenChinhTinh = new Set<SaoName>(brief.chinhTinh.map((sao) => sao.ten));
        const coThuan = brief.luan.some(
          (de) => de.sac === Sac.Thuan && de.do.some((sao) => tenChinhTinh.has(sao)),
        );
        const coNghich = brief.luan.some(
          (de) => de.sac === Sac.Nghich && de.do.some((sao) => tenChinhTinh.has(sao)),
        );
        return !coThuan || !coNghich;
      });

    expect(thieu).toHaveLength(0);
  });
});
