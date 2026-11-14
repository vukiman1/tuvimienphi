import type { ChartView } from '@/features/la-so/chart-types';
import { cungFacts } from '@/features/la-so/cung-facts';
import { SAMPLE_CHART, indexOfCung } from '@/test-utils/sample-chart';

const MENH_INDEX = indexOfCung('Mệnh');
const VO_CHINH_DIEU_INDEX = SAMPLE_CHART.cungs.findIndex((cung) => cung.isVoChinhDieu);
const DAI_VAN_LAST_YEAR_OFFSET = 9;

describe('cungFacts', () => {
  it('names the tam hợp, xung chiếu and nhị hợp cung', () => {
    const facts = cungFacts(SAMPLE_CHART, MENH_INDEX);

    expect(facts.cungName).toBe('Mệnh');
    expect(facts.tamHop).toEqual(['Quan Lộc', 'Tài Bạch']);
    expect(facts.xungChieu).toBe('Thiên Di');
    expect(facts.nhiHop).toBe('Tật Ách');
  });

  it('spans ten years of đại vận', () => {
    const { daiVan } = cungFacts(SAMPLE_CHART, MENH_INDEX);

    expect(daiVan.from).toBe(SAMPLE_CHART.cungs[MENH_INDEX].daiVanStartAge);
    expect(daiVan.to - daiVan.from).toBe(DAI_VAN_LAST_YEAR_OFFSET);
  });

  it('names where a vô chính diệu cung borrows from', () => {
    const facts = cungFacts(SAMPLE_CHART, VO_CHINH_DIEU_INDEX);

    expect(facts.muonTu).toBe(facts.xungChieu);
  });

  it('borrows from nowhere when the cung has its own chính tinh', () => {
    expect(cungFacts(SAMPLE_CHART, MENH_INDEX).muonTu).toBeNull();
  });

  it('marks a cung that Tuần covers and one that Triệt covers', () => {
    const tuanIndex = SAMPLE_CHART.cungs.findIndex((cung) => cung.hasTuan);
    const trietIndex = SAMPLE_CHART.cungs.findIndex((cung) => cung.hasTriet);

    expect(cungFacts(SAMPLE_CHART, tuanIndex).anNgu).toEqual(['Tuần']);
    expect(cungFacts(SAMPLE_CHART, trietIndex).anNgu).toEqual(['Triệt']);
  });

  it('marks neither on a cung they miss', () => {
    const clearIndex = SAMPLE_CHART.cungs.findIndex((cung) => !cung.hasTuan && !cung.hasTriet);

    expect(cungFacts(SAMPLE_CHART, clearIndex).anNgu).toEqual([]);
  });

  it('marks both Tuần and Triệt on a cung they both cover', () => {
    const covered: ChartView = {
      ...SAMPLE_CHART,
      cungs: SAMPLE_CHART.cungs.map((cung, index) =>
        index === MENH_INDEX ? { ...cung, hasTuan: true, hasTriet: true } : cung,
      ),
    };

    expect(cungFacts(covered, MENH_INDEX).anNgu).toEqual(['Tuần', 'Triệt']);
  });
});
