import { castNatal } from '../cast-chart.js';
import { Gender } from '../van-han.js';
import { buildCongDanhBrief } from './build-cong-danh-brief.js';

describe('buildCongDanhBrief — Tứ Hoá tại Quan Lộc', () => {
  it('Hoá Kỵ giảm mặt thuận của chính tinh mang nó và thêm mệnh đề vướng lại', () => {
    const chart = castNatal({ solarDate: new Date(1950, 6, 15), hour: 13, gender: Gender.Nam });

    const brief = buildCongDanhBrief(chart);

    expect(
      brief?.luan.some(
        (de) =>
          de.do.includes('Thiên Đồng') && de.sac === 'nghich' && de.tuKhoa.includes('vướng lại'),
      ),
    ).toBe(true);
  });

  it('Hoá Quyền nâng trọng số mệnh đề của chính tinh mang nó', () => {
    const chart = castNatal({ solarDate: new Date(1951, 6, 15), hour: 21, gender: Gender.Nam });

    const brief = buildCongDanhBrief(chart);
    const thuanThaiDuong = brief?.luan.find(
      (de) => de.do.includes('Thái Dương') && de.sac === 'thuan',
    );

    expect(thuanThaiDuong?.trong).toBe(78);
  });
});

describe('buildCongDanhBrief — cách cục tam hợp', () => {
  it('gọi tên cách cục khi nhóm chính tinh tam hợp đủ ngưỡng', () => {
    const chart = castNatal({ solarDate: new Date(1950, 6, 15), hour: 13, gender: Gender.Nam });

    const brief = buildCongDanhBrief(chart);

    expect(
      brief?.luan.some((de) => de.tuKhoa.includes('Cơ Nguyệt Đồng Lương') && de.do.length === 0),
    ).toBe(true);
  });
});
