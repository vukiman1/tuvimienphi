import { castNatal } from '../cast-chart.js';
import { Gender } from '../van-han.js';
import { buildMenhBrief } from './build-menh-brief.js';

describe('buildMenhBrief — Tứ Hoá tại Mệnh', () => {
  it('Hoá Kỵ giảm mặt thuận của chính tinh mang nó và thêm mệnh đề vướng lại', () => {
    const chart = castNatal({ solarDate: new Date(1953, 6, 15), hour: 5, gender: Gender.Nam });

    const brief = buildMenhBrief(chart);

    expect(
      brief?.luan.some(
        (de) =>
          de.do.includes('Tham Lang') && de.sac === 'nghich' && de.tuKhoa.includes('vướng lại'),
      ),
    ).toBe(true);
  });

  it('Hoá Quyền nâng trọng số mệnh đề của chính tinh mang nó', () => {
    const chart = castNatal({ solarDate: new Date(1951, 6, 15), hour: 5, gender: Gender.Nam });

    const brief = buildMenhBrief(chart);
    const thuanThaiDuong = brief?.luan.find(
      (de) => de.do.includes('Thái Dương') && de.sac === 'thuan',
    );

    expect(thuanThaiDuong?.trong).toBe(78);
  });
});
