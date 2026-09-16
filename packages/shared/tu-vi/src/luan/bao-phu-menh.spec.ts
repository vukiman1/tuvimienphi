import { castNatal } from '../cast-chart.js';
import { CHINH_TINH_NAMES } from '../sao-names.js';
import { Gender } from '../van-han.js';
import { CHINH_TINH_MENH } from './bang/menh/chinh-tinh-menh.js';
import { buildMenhBrief } from './build-menh-brief.js';
import { Sac } from './luan-de.js';

/** Bốn giờ trải đều một ngày là đủ để đổi cung Mệnh; quét dày hơn chỉ tốn thời gian chạy. */
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

describe('bảng luận cung Mệnh', () => {
  it('có ô cho đủ mười bốn chính tinh', () => {
    for (const sao of CHINH_TINH_NAMES) {
      expect(CHINH_TINH_MENH[sao]).toBeDefined();
    }
  });

  it('mỗi ô đều có ít nhất một mệnh đề thuận và một mệnh đề nghịch', () => {
    for (const [sao, cell] of Object.entries(CHINH_TINH_MENH)) {
      const chieu = new Set(cell?.chung.map((de) => de.sac));
      expect([sao, chieu.has(Sac.Thuan)]).toEqual([sao, true]);
      expect([sao, chieu.has(Sac.Nghich)]).toEqual([sao, true]);
    }
  });

  it('dựng được bài cho mọi lá số quét qua', () => {
    const thieu = quetLaSo().filter((chart) => buildMenhBrief(chart) === null);

    expect(thieu).toHaveLength(0);
  });
});
