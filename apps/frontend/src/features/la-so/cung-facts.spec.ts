import type { ChartView } from '@/features/la-so/chart-types';
import { CalendarType, Gender } from '@/features/la-so/birth-input';
import { cungFacts } from '@/features/la-so/cung-facts';
import { toChartView } from '@/features/la-so/to-chart-view';

const CHART = toChartView({
  day: 12,
  month: 3,
  year: 1995,
  calendar: CalendarType.Solar,
  hour: 'Ngọ',
  gender: Gender.Male,
  viewYear: 2026,
});
const MENH_INDEX = CHART.cungs.findIndex((cung) => cung.isMenh);
const VO_CHINH_DIEU_INDEX = CHART.cungs.findIndex((cung) => cung.isVoChinhDieu);
const DAI_VAN_LAST_YEAR_OFFSET = 9;

describe('cungFacts', () => {
  it('names the tam hợp, xung chiếu and nhị hợp cung', () => {
    const facts = cungFacts(CHART, MENH_INDEX);

    expect(facts.cungName).toBe('Mệnh');
    expect(facts.tamHop).toEqual(['Quan Lộc', 'Tài Bạch']);
    expect(facts.xungChieu).toBe('Thiên Di');
    expect(facts.nhiHop).toBe('Tật Ách');
  });

  it('spans ten years of đại vận', () => {
    const { daiVan } = cungFacts(CHART, MENH_INDEX);

    expect(daiVan.from).toBe(CHART.cungs[MENH_INDEX].daiVanStartAge);
    expect(daiVan.to - daiVan.from).toBe(DAI_VAN_LAST_YEAR_OFFSET);
  });

  it('names where a vô chính diệu cung borrows from', () => {
    const facts = cungFacts(CHART, VO_CHINH_DIEU_INDEX);

    expect(facts.muonTu).toBe(facts.xungChieu);
  });

  it('borrows from nowhere when the cung has its own chính tinh', () => {
    expect(cungFacts(CHART, MENH_INDEX).muonTu).toBeNull();
  });

  it('marks a cung that Tuần covers and one that Triệt covers', () => {
    const tuanIndex = CHART.cungs.findIndex((cung) => cung.hasTuan);
    const trietIndex = CHART.cungs.findIndex((cung) => cung.hasTriet);

    expect(cungFacts(CHART, tuanIndex).anNgu).toEqual(['Tuần']);
    expect(cungFacts(CHART, trietIndex).anNgu).toEqual(['Triệt']);
  });

  it('marks neither on a cung they miss', () => {
    const clearIndex = CHART.cungs.findIndex((cung) => !cung.hasTuan && !cung.hasTriet);

    expect(cungFacts(CHART, clearIndex).anNgu).toEqual([]);
  });

  it('marks both Tuần and Triệt on a cung they both cover', () => {
    const covered: ChartView = {
      ...CHART,
      cungs: CHART.cungs.map((cung, index) =>
        index === MENH_INDEX ? { ...cung, hasTuan: true, hasTriet: true } : cung,
      ),
    };

    expect(cungFacts(covered, MENH_INDEX).anNgu).toEqual(['Tuần', 'Triệt']);
  });
});
