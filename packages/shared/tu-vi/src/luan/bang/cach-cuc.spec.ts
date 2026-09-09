import { castNatal } from '../../cast-chart.js';
import { Gender } from '../../van-han.js';
import { cachCucTai } from './cach-cuc.js';

const CHART = castNatal({ solarDate: new Date(1960, 4, 26), hour: 21, gender: Gender.Nam });

describe('cachCucTai', () => {
  it('đọc cách cục từ cả tam hợp cục chứ không riêng cung đang xét', () => {
    const tai = cachCucTai(CHART, CHART.thanIndex).map((cach) => cach.ten);
    const riengCung = CHART.cungs[CHART.thanIndex].chinhTinh.map((sao) => sao.name);

    // Ba nhóm chính tinh trải khắp tam hợp, nên đọc riêng một cung không đủ để gọi tên cách nào.
    expect(riengCung.length).toBeLessThan(3);
    expect(tai.length).toBeGreaterThan(0);
  });

  it('mọi cách tìm được đều có mệnh đề đi kèm', () => {
    for (const cach of cachCucTai(CHART, CHART.thanIndex)) {
      expect(cach.luan.length).toBeGreaterThan(0);
      expect(cach.ten.length).toBeGreaterThan(0);
    }
  });
});
