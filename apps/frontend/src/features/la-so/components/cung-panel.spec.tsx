import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CUNG_Y_NGHIA, type CungName, type NguHanh } from '@org/shared-tu-vi';
import { FOCUS_RING_CLASS } from '@/design-system';
import type { ChartView } from '@/features/la-so/chart-types';
import { cungFacts } from '@/features/la-so/cung-facts';
import { quickLuanFor } from '@/features/la-so/quick-luan';
import {
  SAMPLE_BIRTH,
  SAMPLE_CHART,
  SAMPLE_VIEW_YEAR,
  indexOfCung,
} from '@/test-utils/sample-chart';
import { RATING_LABEL } from '@/features/la-so/components/cung-panel.constants';
import { CungPanel } from './cung-panel';

const DAI_VAN_LAST_YEAR_OFFSET = 9;
const HANH_ICON_SLUG: Readonly<Record<NguHanh, string>> = {
  Kim: 'kim',
  Mộc: 'moc',
  Thủy: 'thuy',
  Hỏa: 'hoa',
  Thổ: 'tho',
};

function renderPanelIn(
  name: CungName,
  onReadChapter: (order: string) => void = () => undefined,
  chart: ChartView = SAMPLE_CHART,
): ReturnType<typeof render> {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <CungPanel
        birth={SAMPLE_BIRTH}
        chart={chart}
        index={indexOfCung(name)}
        onReadChapter={onReadChapter}
        viewYear={SAMPLE_VIEW_YEAR}
      />
    </QueryClientProvider>,
  );
}

function renderPanel(
  name: CungName,
  onReadChapter: (order: string) => void = () => undefined,
  chart: ChartView = SAMPLE_CHART,
): HTMLElement {
  renderPanelIn(name, onReadChapter, chart);
  return screen.getByRole('heading', { level: 2 });
}

describe('CungPanel', () => {
  it('titles the panel with the cung and its chi', () => {
    const heading = renderPanel('Mệnh');

    expect(heading.textContent).toBe(`Cung Mệnh · ${SAMPLE_CHART.cungs[indexOfCung('Mệnh')].chi}`);
  });

  it('marks the cung that holds the Thân', () => {
    const index = SAMPLE_CHART.cungs.findIndex((cung) => cung.isThan);

    renderPanel(SAMPLE_CHART.cungs[index].cungName);

    expect(screen.getByText('THÂN')).toBeTruthy();
  });

  it('marks the tiểu hạn cung of the view year', () => {
    const index = SAMPLE_CHART.cungs.findIndex((cung) => cung.isTieuHan);

    renderPanel(SAMPLE_CHART.cungs[index].cungName);

    expect(screen.getByText(`Tiểu hạn ${SAMPLE_VIEW_YEAR}`)).toBeTruthy();
  });

  it('shows no tags on an ordinary cung', () => {
    const index = SAMPLE_CHART.cungs.findIndex((cung) => !cung.isThan && !cung.isTieuHan);

    renderPanel(SAMPLE_CHART.cungs[index].cungName);

    expect(screen.queryByText('THÂN')).toBeNull();
    expect(screen.queryByText(/^Tiểu hạn/)).toBeNull();
  });

  it('shows the fact chips', () => {
    renderPanel('Mệnh');
    const { daiVanStartAge } = SAMPLE_CHART.cungs[indexOfCung('Mệnh')];

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
    const [star] = SAMPLE_CHART.cungs[indexOfCung('Tử Tức')].chinhTinh;

    const row = screen.getByText(star.starName).closest('li');

    expect(star.rating).not.toBeNull();
    expect(row?.textContent).toContain(RATING_LABEL[star.rating ?? 'B']);
  });

  it('heads the panel with the emblem of the picked cung', () => {
    const { container } = renderPanelIn('Quan Lộc');

    const emblem = container.querySelector('img[src*="/cung-quan-loc-"]');

    expect(emblem).not.toBeNull();
    expect(emblem?.getAttribute('srcset')).toContain('/cung-quan-loc-256.webp 256w');
  });

  it('keeps the cung emblem out of the accessibility tree', () => {
    const { container } = renderPanelIn('Mệnh');

    const emblem = container.querySelector('img[src*="/cung-menh-"]');

    expect(emblem?.getAttribute('alt')).toBe('');
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('marks each chính tinh with the icon of its hành', () => {
    renderPanel('Tử Tức');
    const [star] = SAMPLE_CHART.cungs[indexOfCung('Tử Tức')].chinhTinh;

    const icon = screen.getByText(star.starName).querySelector('img');

    expect(icon?.getAttribute('src')).toContain(`/hanh-${HANH_ICON_SLUG[star.element]}-64.webp`);
    expect(icon?.getAttribute('alt')).toBe('');
  });

  it('explains a vô chính diệu cung', () => {
    renderPanel('Tài Bạch');
    const { muonTu } = cungFacts(SAMPLE_CHART, indexOfCung('Tài Bạch'));

    expect(screen.getByText(new RegExp(`Vô chính diệu.*mượn .* từ cung ${muonTu}`))).toBeTruthy();
  });

  it('shows one thuận and one nghịch claim with their stars', async () => {
    renderPanel('Mệnh');
    const result = quickLuanFor(SAMPLE_BIRTH, 'Mệnh');

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
    const result = quickLuanFor(SAMPLE_BIRTH, 'Mệnh');
    const stars = [...(result?.thuan.do ?? []), ...(result?.nghich.do ?? [])];
    const rated = SAMPLE_CHART.cungs
      .flatMap((cung) => cung.chinhTinh)
      .find((star) => star.rating && stars.includes(star.starName));
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
      ...SAMPLE_CHART,
      cungs: SAMPLE_CHART.cungs.map((cung) =>
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
      ...SAMPLE_CHART,
      cungs: SAMPLE_CHART.cungs.map((cung) =>
        cung.isMenh ? { ...cung, hasTuan: true, hasTriet: true } : cung,
      ),
    };

    renderPanel('Mệnh', undefined, both);

    expect(screen.getByText('Tuần')).toBeTruthy();
    expect(screen.getByText('Triệt')).toBeTruthy();
  });

  it('shows luận nhanh for a cung without a chapter, with no chapter link', async () => {
    renderPanel('Thiên Di');

    expect(await screen.findAllByText(/^Vì sao:/)).toHaveLength(2);
    expect(screen.queryByText(/^Đọc luận giải chương/)).toBeNull();
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
    const busiest = [...SAMPLE_CHART.cungs].sort(
      (a, b) => b.catTinh.length + b.hungTinh.length - (a.catTinh.length + a.hungTinh.length),
    )[0];
    renderPanel(busiest.cungName);

    const names = [...busiest.catTinh, ...busiest.hungTinh].map((star) => star.name);
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      expect(screen.getAllByText(name).length).toBeGreaterThan(0);
    }
  });

  it('omits a star group that is empty', () => {
    const bare = SAMPLE_CHART.cungs.find((cung) => cung.daiVanTinh.length === 0);
    expect(bare).toBeDefined();
    renderPanel((bare ?? SAMPLE_CHART.cungs[0]).cungName);

    expect(screen.queryByRole('heading', { level: 3, name: 'Đại vận' })).toBeNull();
  });
});
