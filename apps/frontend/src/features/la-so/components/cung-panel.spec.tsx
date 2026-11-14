import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  CHINH_TINH_NAMES,
  CUNG_NAMES,
  CUNG_Y_NGHIA,
  QUICK_LUAN_CUNG,
  type CungName,
} from '@org/shared-tu-vi';
import { FOCUS_RING_CLASS } from '@/design-system';
import type { ChartView } from '@/features/la-so/chart-types';
import { CalendarType, Gender, type BirthInput } from '@/features/la-so/birth-input';
import { hasQuickLuan } from '@/features/la-so/cung-chapters';
import { cungNameOf } from '@/features/la-so/cung-slug';
import { cungFacts } from '@/features/la-so/cung-facts';
import { toChartView } from '@/features/la-so/to-chart-view';
import { quickLuanFor } from '@/features/la-so/quick-luan';
import { RATING_LABEL } from '@/features/la-so/components/cung-panel.constants';
import { CungPanel } from './cung-panel';

const BIRTH: BirthInput = {
  day: 12,
  month: 3,
  year: 1995,
  calendar: CalendarType.Solar,
  hour: 'Ngọ',
  gender: Gender.Male,
};
const VIEW_YEAR = 2026;
const CHART = toChartView({ ...BIRTH, viewYear: VIEW_YEAR });
const DAI_VAN_LAST_YEAR_OFFSET = 9;

function indexOfCung(name: CungName): number {
  return CHART.cungs.findIndex((cung) => cungNameOf(cung) === name);
}

function renderPanel(
  name: CungName,
  onReadChapter: (order: string) => void = () => undefined,
  chart: ChartView = CHART,
): HTMLElement {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <CungPanel
        birth={BIRTH}
        chart={chart}
        index={indexOfCung(name)}
        onReadChapter={onReadChapter}
        viewYear={VIEW_YEAR}
      />
    </QueryClientProvider>,
  );
  return screen.getByRole('heading', { level: 2 });
}

describe('CungPanel', () => {
  it('titles the panel with the cung and its chi', () => {
    const heading = renderPanel('Mệnh');

    expect(heading.textContent).toBe(`Cung Mệnh · ${CHART.cungs[indexOfCung('Mệnh')].chi}`);
  });

  it('shows the fact chips', () => {
    renderPanel('Mệnh');
    const { daiVanStartAge } = CHART.cungs[indexOfCung('Mệnh')];

    expect(
      screen.getByText(
        `Đại vận ${daiVanStartAge}–${daiVanStartAge + DAI_VAN_LAST_YEAR_OFFSET} tuổi`,
      ),
    ).toBeTruthy();
    expect(screen.getByText('Tam hợp: Quan Lộc · Tài Bạch')).toBeTruthy();
    expect(screen.getByText('Xung chiếu: Thiên Di')).toBeTruthy();
    expect(screen.getByText('Nhị hợp: Tật Ách')).toBeTruthy();
    expect(screen.getByText('Tuần')).toBeTruthy();
  });

  it('says what the cung governs', () => {
    renderPanel('Mệnh');

    expect(screen.getByText(CUNG_Y_NGHIA['Mệnh'])).toBeTruthy();
  });

  it('writes brightness in full', () => {
    renderPanel('Tử Tức');
    const [star] = CHART.cungs[indexOfCung('Tử Tức')].chinhTinh;
    const properName = CHINH_TINH_NAMES.find((name) => name.toUpperCase() === star.name);

    const row = screen.getByText(properName ?? '').closest('li');

    expect(star.rating).not.toBeNull();
    expect(row?.textContent).toContain(RATING_LABEL[star.rating ?? 'B']);
  });

  it('explains a vô chính diệu cung', () => {
    renderPanel('Tài Bạch');
    const { muonTu } = cungFacts(CHART, indexOfCung('Tài Bạch'));

    expect(screen.getByText(new RegExp(`Vô chính diệu.*mượn .* từ cung ${muonTu}`))).toBeTruthy();
  });

  it('shows one thuận and one nghịch claim with their stars', async () => {
    renderPanel('Mệnh');
    const result = quickLuanFor(BIRTH, 'Mệnh');

    expect(screen.queryByText('Nét thuận')).toBeNull();
    expect(screen.getByRole('status', { name: 'Đang soạn luận nhanh' })).toBeTruthy();

    expect(result).not.toBeNull();
    const claim = result?.thuan.y ?? '';
    expect(
      await screen.findByText(`${claim.charAt(0).toUpperCase()}${claim.slice(1)}.`),
    ).toBeTruthy();
    expect(screen.getAllByText(/^Vì sao:/)).toHaveLength(2);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('names the brightness of the stars behind a claim', async () => {
    renderPanel('Mệnh');
    const result = quickLuanFor(BIRTH, 'Mệnh');
    const stars = [...(result?.thuan.do ?? []), ...(result?.nghich.do ?? [])];
    const rated = CHART.cungs
      .flatMap((cung) => cung.chinhTinh)
      .map((star) => ({ name: star.name, rating: star.rating }))
      .find((star) => star.rating && stars.some((name) => name.toUpperCase() === star.name));
    expect(rated).toBeDefined();
    const label = RATING_LABEL[rated?.rating ?? 'B'];

    const lines = await screen.findAllByText(/^Vì sao:/);

    expect(lines.some((line) => line.textContent?.includes(`(${label})`))).toBe(true);
  });

  it('hides the rating of a star that has none', async () => {
    renderPanel('Mệnh');

    const lines = await screen.findAllByText(/^Vì sao:/);

    expect(lines.every((line) => !line.textContent?.includes('()'))).toBe(true);
  });

  it('reads just Vô chính diệu when nothing is borrowed', () => {
    const bare: ChartView = {
      ...CHART,
      cungs: CHART.cungs.map((cung) =>
        cung.isVoChinhDieu ? { ...cung, chinhTinhMuon: [] } : cung,
      ),
    };

    renderPanel('Tài Bạch', undefined, bare);

    expect(screen.getByText('Vô chính diệu')).toBeTruthy();
    expect(screen.queryByText(/mượn/)).toBeNull();
  });

  it('gives the chapter link the focus ring', () => {
    renderPanel('Quan Lộc');

    const link = screen.getByText('Đọc luận giải chương Công danh Sự nghiệp');

    expect(FOCUS_RING_CLASS.split(' ').every((token) => link.classList.contains(token))).toBe(true);
  });

  it('shows both Tuần and Triệt chips when a cung carries both', () => {
    const both: ChartView = {
      ...CHART,
      cungs: CHART.cungs.map((cung) =>
        cung.isMenh ? { ...cung, hasTuan: true, hasTriet: true } : cung,
      ),
    };

    renderPanel('Mệnh', undefined, both);

    expect(screen.getByText('Tuần')).toBeTruthy();
    expect(screen.getByText('Triệt')).toBeTruthy();
  });

  it('has no luận nhanh for Thiên Di', () => {
    renderPanel('Thiên Di');

    expect(screen.queryByText('Luận nhanh')).toBeNull();
  });

  it('links Quan Lộc to chapter 03', () => {
    const onReadChapter = jest.fn();
    renderPanel('Quan Lộc', onReadChapter);

    fireEvent.click(screen.getByText('Đọc luận giải chương Công danh Sự nghiệp'));

    expect(onReadChapter).toHaveBeenCalledWith('03');
  });

  it('links Tử Tức to the Tình duyên Gia đạo chapter', () => {
    const onReadChapter = jest.fn();
    renderPanel('Tử Tức', onReadChapter);

    fireEvent.click(screen.getByText('Đọc luận giải chương Tình duyên Gia đạo'));

    expect(onReadChapter).toHaveBeenCalledWith('05');
  });

  it('lists every phụ tinh in the panel even in Gọn', () => {
    const busiest = [...CHART.cungs].sort(
      (a, b) => b.catTinh.length + b.hungTinh.length - (a.catTinh.length + a.hungTinh.length),
    )[0];
    renderPanel(cungNameOf(busiest));

    const names = [...busiest.catTinh, ...busiest.hungTinh].map((star) => star.name);
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      expect(screen.getAllByText(name).length).toBeGreaterThan(0);
    }
  });

  it('omits a star group that is empty', () => {
    const bare = CHART.cungs.find((cung) => cung.daiVanTinh.length === 0);
    expect(bare).toBeDefined();
    renderPanel(cungNameOf(bare ?? CHART.cungs[0]));

    expect(screen.queryByRole('heading', { level: 3, name: 'Đại vận' })).toBeNull();
  });
});

describe('quick luận coverage', () => {
  it('is offered for exactly the cung the engine reads quickly', () => {
    expect(CUNG_NAMES.filter(hasQuickLuan)).toEqual(
      CUNG_NAMES.filter((name) => QUICK_LUAN_CUNG.includes(name)),
    );
  });
});
