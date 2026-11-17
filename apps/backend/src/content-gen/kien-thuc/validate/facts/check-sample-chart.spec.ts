import { castSampleChart } from '@org/shared-kien-thuc';
import { checkSampleChart } from './check-sample-chart';

describe('checkSampleChart', () => {
  const chart = castSampleChart();

  function menhCung() {
    const menh = chart.cungs.find((cung) => cung.isMenh);
    if (menh === undefined) throw new Error('sample chart has no Mệnh');
    return menh;
  }

  it('places the Mệnh star where the chart has it', () => {
    const menh = menhCung();
    const star = menh.chinhTinh[0].name;
    expect(checkSampleChart(`Cung ${menh.name} có ${star}.`, chart).violations).toEqual([]);

    const other = chart.cungs.find(
      (cung) => cung.name !== menh.name && !cung.chinhTinh.some((placed) => placed.name === star),
    );
    if (other === undefined) throw new Error('no palace without the Mệnh star');
    expect(
      checkSampleChart(`Cung ${other.name} có ${star}.`, chart).violations.length,
    ).toBeGreaterThan(0);
  });

  it('does not read Mệnh chủ as cung Mệnh', () => {
    expect(checkSampleChart(`Mệnh chủ là ${chart.chuMenh}.`, chart).violations).toEqual([]);
  });
});
