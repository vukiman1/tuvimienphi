import { tamHopIndexes, xungChieuIndex } from '@org/shared-tu-vi';
import { castSampleChart } from './sample-chart.js';

const SAT_TINH = ['Kình Dương', 'Đà La', 'Địa Không', 'Địa Kiếp'];

describe('sample chart', () => {
  it('gives the sample Mệnh a bright chính tinh', () => {
    const chart = castSampleChart();
    const menh = chart.cungs.find((cung) => cung.isMenh);
    if (!menh) {
      throw new Error('sample chart has no Mệnh cung');
    }
    expect(menh.chinhTinh.length).toBeGreaterThan(0);
    for (const star of menh.chinhTinh) {
      expect(['M', 'V', 'Đ']).toContain(star.rating);
    }
  });

  it('keeps the four sát tinh out of the sample Mệnh', () => {
    const chart = castSampleChart();
    const menh = chart.cungs.find((cung) => cung.isMenh);
    if (!menh) {
      throw new Error('sample chart has no Mệnh cung');
    }
    const names = menh.phuTinh.map((star) => star.name);
    for (const sat of SAT_TINH) {
      expect(names).not.toContain(sat);
    }
  });

  it('keeps Thân apart from Mệnh', () => {
    const chart = castSampleChart();
    expect(chart.thanIndex).not.toBe(chart.menhIndex);
  });

  it('puts a vô chính diệu cung in the Mệnh tam phương', () => {
    const chart = castSampleChart();
    const tamPhuongChi = [xungChieuIndex(chart.menhIndex), ...tamHopIndexes(chart.menhIndex)];
    const voChinhDieu = chart.cungs.some(
      (cung) => tamPhuongChi.includes(cung.chiIndex) && cung.isVoChinhDieu,
    );
    expect(voChinhDieu).toBe(true);
  });
});
