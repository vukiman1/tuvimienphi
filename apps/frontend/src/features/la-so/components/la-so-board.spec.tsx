import { useState, type ReactElement } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import type { NguHanh } from '@org/shared-tu-vi';
import { FOCUS_RING_CLASS } from '@/design-system';
import { CalendarType, Gender } from '@/features/la-so/birth-input';
import { FULL_BOARD_WIDTH } from '@/features/la-so/board-fit';
import { BOARD_SIZE } from '@/features/la-so/board-layout';
import type { ChartView, CungView } from '@/features/la-so/chart-types';
import { toChartView } from '@/features/la-so/to-chart-view';
import { LaSoBoard } from './la-so-board';

const SAMPLE_BIRTH = {
  day: 12,
  month: 3,
  year: 1995,
  calendar: CalendarType.Solar,
  hour: 'Ngọ',
  gender: Gender.Male,
} as const;
const VIEW_YEAR = 2026;
const WIDE_CONTAINER = 1024;
const PHONE_CONTAINER = 360;
const FULL_CONTAINER_NARROWER_THAN_BOARD = 700;
const EQUAL_GROWING_ROWS = new RegExp(`^repeat\\(${BOARD_SIZE}, minmax\\(\\d+px, 1fr\\)\\)$`);
const TY = 0;
const TY_RELATED = [4, 8, 6, 1] as const;
const SPOTLIGHT_CLASS = 'bg-gold/10';
const DIMMED_CLASS = 'opacity-30';
const RELATED_MARKER = 'ring-1';

const HANH_CLASS: Readonly<Record<NguHanh, string>> = {
  Kim: 'text-hanh-kim',
  Mộc: 'text-hanh-moc',
  Thủy: 'text-hanh-thuy',
  Hỏa: 'text-hanh-hoa',
  Thổ: 'text-hanh-tho',
};

const STUBBED_RESIZE_OBSERVER = globalThis.ResizeObserver;

function observeWidth(width: number): void {
  class FixedWidthObserver implements ResizeObserver {
    constructor(private readonly callback: ResizeObserverCallback) {}

    observe(target: Element): void {
      const entry = { target, contentRect: { width, height: 0 } } as ResizeObserverEntry;
      this.callback([entry], this);
    }

    unobserve(): void {
      return undefined;
    }

    disconnect(): void {
      return undefined;
    }
  }
  Object.assign(globalThis, { ResizeObserver: FixedWidthObserver });
}

class SilentObserver {
  observe(): void {
    return undefined;
  }

  unobserve(): void {
    return undefined;
  }

  disconnect(): void {
    return undefined;
  }
}

function observeNothingUntilLaterWithLayoutWidth(width: number): void {
  Object.assign(globalThis, { ResizeObserver: SilentObserver });
  jest.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(width);
}

const CHART: ChartView = toChartView({ ...SAMPLE_BIRTH, viewYear: VIEW_YEAR });
const [MENH] = CHART.cungs.filter((cung) => cung.isMenh);

function BoardHarness(): ReactElement {
  const [selectedIndex, setSelectedIndex] = useState(MENH.index);
  return <LaSoBoard chart={CHART} onSelect={setSelectedIndex} selectedIndex={selectedIndex} />;
}

function renderBoard(): ReturnType<typeof render> {
  return render(<BoardHarness />);
}

function cungButton(cung: CungView): HTMLElement {
  return screen.getByRole('button', { name: `Cung ${cung.name}` });
}

function follows(later: Node, earlier: Node): boolean {
  return (earlier.compareDocumentPosition(later) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
}

function zoomedElements(container: HTMLElement): readonly HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>('*')].filter((element) =>
    Boolean(element.style.zoom),
  );
}

function paintScaledElements(container: HTMLElement): readonly HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>('*')].filter((element) =>
    element.style.transform.includes('scale('),
  );
}

function starCount(cung: CungView): number {
  return (
    cung.chinhTinh.length +
    cung.catTinh.length +
    cung.hungTinh.length +
    cung.luuTinh.length +
    cung.daiVanTinh.length
  );
}

function busiestCung(): CungView {
  return CHART.cungs.reduce((busiest, cung) =>
    starCount(cung) > starCount(busiest) ? cung : busiest,
  );
}

function boardGrid(cell: HTMLElement): HTMLElement {
  for (let node = cell.parentElement; node !== null; node = node.parentElement) {
    if (node.style.gridTemplateRows !== '') return node;
  }
  throw new Error(`No board grid around ${cell.getAttribute('aria-label') ?? 'the cell'}`);
}

function pinnedHeightsBetween(cell: HTMLElement, container: HTMLElement): readonly string[] {
  const heights: string[] = [];
  for (
    let node: HTMLElement | null = cell;
    node !== null && node !== container;
    node = node.parentElement
  ) {
    if (node.style.height !== '') heights.push(node.style.height);
  }
  return heights;
}

function byIndex(first: number, second: number): number {
  return first - second;
}

function markedCungIndexes(): readonly number[] {
  return CHART.cungs
    .filter((cung) => {
      const tokens = classTokens(cungButton(cung));
      return tokens.includes(RELATED_MARKER) && tokens.includes('ring-gold');
    })
    .map((cung) => cung.index)
    .sort(byIndex);
}

function ownText(element: Element): string {
  return [...element.childNodes]
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent ?? '')
    .join('');
}

function elementReading(container: HTMLElement, text: string): HTMLElement | undefined {
  return [...container.querySelectorAll<HTMLElement>('*')].find(
    (element) => ownText(element) === text,
  );
}

function classTokens(element: Element | undefined): readonly string[] {
  return element?.getAttribute('class')?.split(/\s+/) ?? [];
}

afterEach(() => {
  Object.assign(globalThis, { ResizeObserver: STUBBED_RESIZE_OBSERVER });
  jest.restoreAllMocks();
});

describe('LaSoBoard on a wide container', () => {
  beforeEach(() => observeWidth(WIDE_CONTAINER));

  it('paints every star with its hành token', () => {
    renderBoard();
    const button = cungButton(MENH);
    const stars = [
      ...MENH.chinhTinh.map((sao) => ({ text: `${sao.polarity ?? ''}${sao.name}`, sao })),
      ...[...MENH.catTinh, ...MENH.hungTinh].map((sao) => ({ text: sao.name, sao })),
      ...MENH.luuTinh.map((sao) => ({ text: `L.${sao.name}`, sao })),
      ...MENH.daiVanTinh.map((sao) => ({ text: `ĐV.${sao.name}`, sao })),
    ];

    expect(stars.length).toBeGreaterThan(0);
    for (const { text, sao } of stars) {
      const element = elementReading(button, text);
      expect(element).toBeDefined();
      expect(classTokens(element)).toContain(HANH_CLASS[sao.element]);
    }
  });

  it('marks only the picked cung with an ink ring', () => {
    renderBoard();
    const pressed = screen
      .getAllByRole('button', { name: /^Cung / })
      .filter((button) => classTokens(button).includes('ring-ink'));

    expect(pressed).toEqual([cungButton(MENH)]);
    expect(cungButton(MENH).getAttribute('aria-pressed')).toBe('true');
  });

  it('spotlights the hovered cung with its tam hợp, xung chiếu and nhị hợp', () => {
    renderBoard();
    const hovered = CHART.cungs[TY];

    fireEvent.mouseEnter(cungButton(hovered));

    expect(classTokens(cungButton(hovered))).toEqual(
      expect.arrayContaining(['ring-gold', SPOTLIGHT_CLASS]),
    );
    for (const index of TY_RELATED) {
      expect(classTokens(cungButton(CHART.cungs[index]))).toContain(SPOTLIGHT_CLASS);
    }
  });

  it('keeps every cell readable while one is spotlit', () => {
    const { container } = renderBoard();

    fireEvent.mouseEnter(cungButton(CHART.cungs[TY]));

    expect(container.querySelectorAll(`.${DIMMED_CLASS}`)).toHaveLength(0);
  });

  it('marks the related cung of the hovered one with a thin gold ring', () => {
    renderBoard();

    fireEvent.mouseEnter(cungButton(CHART.cungs[TY]));

    expect(markedCungIndexes()).toEqual([...TY_RELATED].sort(byIndex));
  });

  it('returns to a flat board when the pointer leaves', () => {
    const { container } = renderBoard();
    const hovered = cungButton(CHART.cungs[TY]);

    fireEvent.mouseEnter(hovered);
    fireEvent.mouseLeave(hovered);

    const tinted = [...container.querySelectorAll('*')].filter((element) =>
      classTokens(element).includes(SPOTLIGHT_CLASS),
    );
    expect(tinted).toEqual([]);
  });

  it('draws the tam hợp triangle in deep and the xung chiếu line in ember', () => {
    const { container } = renderBoard();

    expect(container.querySelectorAll('svg line.stroke-deep')).toHaveLength(3);
    expect(container.querySelectorAll('svg line.stroke-ember')).toHaveLength(1);
  });

  it('lets the lines pass under the thiên bàn words instead of across them', () => {
    renderBoard();
    const label = screen.getByText('Lai nhân cung:');
    const words = [screen.getByText('Lá Số Tử Vi'), label, screen.getByText(CHART.meta.chuMenh)];

    for (const word of words) {
      expect(classTokens(word)).toEqual(expect.arrayContaining(['relative', 'z-20', 'bg-day']));
    }
    const stackingAncestors: HTMLElement[] = [];
    for (let node = label.parentElement; node !== null; node = node.parentElement) {
      if (classTokens(node).some((token) => /^z-/.test(token))) stackingAncestors.push(node);
    }
    expect(stackingAncestors).toEqual([]);
  });

  it('keeps the chi labels readable on top of the thiên bàn', () => {
    renderBoard();

    for (const cung of CHART.cungs) {
      const label = screen
        .getAllByText(cung.chi)
        .find((element) => classTokens(element).includes('z-20'));
      expect(classTokens(label)).toContain('bg-day');
    }
  });

  it('sets Tuần and Triệt on the chart-block surface', () => {
    renderBoard();

    for (const label of ['Tuần', 'Triệt']) {
      expect(classTokens(screen.getByText(label))).toEqual(
        expect.arrayContaining(['bg-chart-block', 'text-day']),
      );
    }
  });

  it('gives every cung the two-tone focus ring above its neighbours', () => {
    renderBoard();
    const buttons = screen.getAllByRole('button', { name: /^Cung / });

    expect(buttons).toHaveLength(CHART.cungs.length);
    for (const button of buttons) {
      expect(classTokens(button)).toEqual(
        expect.arrayContaining([...FOCUS_RING_CLASS.split(' '), 'focus-visible:z-30']),
      );
    }
  });
});

describe('LaSoBoard sizing the full board', () => {
  it('lets the busiest cung grow every row instead of clipping its last line', () => {
    observeWidth(WIDE_CONTAINER);
    const { container } = renderBoard();
    const busiest = cungButton(busiestCung());

    expect(pinnedHeightsBetween(busiest, container)).toEqual([]);
    expect(boardGrid(busiest).style.gridTemplateRows).toMatch(EQUAL_GROWING_ROWS);
  });

  it('shrinks the board in layout so the page below starts where the board ends', () => {
    observeWidth(FULL_CONTAINER_NARROWER_THAN_BOARD);
    const { container } = renderBoard();

    expect(paintScaledElements(container)).toEqual([]);
    expect(boardGrid(cungButton(MENH)).style.zoom).toBe(
      String(FULL_CONTAINER_NARROWER_THAN_BOARD / FULL_BOARD_WIDTH),
    );
  });
});

describe('LaSoBoard on a phone-width container', () => {
  beforeEach(() => observeWidth(PHONE_CONTAINER));

  it('shows the compact board on a phone-width container', () => {
    const { container } = renderBoard();

    expect(screen.getAllByRole('button', { name: /^Cung / })).toHaveLength(CHART.cungs.length);
    expect(zoomedElements(container)).toEqual([]);
  });

  it('spotlights the tapped cung without hover', () => {
    renderBoard();
    const tapped = CHART.cungs[TY];

    fireEvent.click(cungButton(tapped));

    expect(cungButton(tapped).getAttribute('aria-pressed')).toBe('true');
    expect(classTokens(cungButton(tapped))).toContain('ring-ink');
    for (const index of [4, 8]) {
      expect(classTokens(cungButton(CHART.cungs[index]))).toContain(SPOTLIGHT_CLASS);
    }
  });

  it('keeps every cell readable on the compact board', () => {
    const { container } = renderBoard();

    fireEvent.click(cungButton(CHART.cungs[TY]));

    expect(container.querySelectorAll(`.${DIMMED_CLASS}`)).toHaveLength(0);
  });

  it('marks the related cung of the tapped one with a thin gold ring', () => {
    renderBoard();

    fireEvent.click(cungButton(CHART.cungs[TY]));

    expect(markedCungIndexes()).toEqual([...TY_RELATED].sort(byIndex));
  });

  it('shows every star of the picked cung in a panel below the board', () => {
    renderBoard();
    const panel = screen.getByRole('region', { name: `Cung ${MENH.name}` });
    const names = [
      ...MENH.catTinh.map((sao) => sao.name),
      ...MENH.hungTinh.map((sao) => sao.name),
      ...MENH.chinhTinh.map((sao) => sao.name),
      ...MENH.luuTinh.map((sao) => `L.${sao.name}`),
    ];

    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      expect(panel.textContent).toContain(name);
    }
  });

  it('follows the picked cung in the panel', () => {
    renderBoard();
    const tapped = CHART.cungs[TY];

    fireEvent.click(cungButton(tapped));

    expect(screen.getByRole('region', { name: `Cung ${tapped.name}` })).toBeTruthy();
  });

  it('keeps the full thiên bàn after the panel', () => {
    renderBoard();
    const panel = screen.getByRole('region', { name: `Cung ${MENH.name}` });

    expect(follows(screen.getByText('Lai nhân cung:'), panel)).toBe(true);
  });
});

describe('LaSoBoard switching layouts', () => {
  it('shows the scaled board and no panel on a wide container', () => {
    observeWidth(WIDE_CONTAINER);
    const { container } = renderBoard();

    expect(screen.queryByRole('region')).toBeNull();
    expect(zoomedElements(container).map((element) => element.style.zoom)).toEqual(['1']);
  });

  it('keeps the panel free of the board buttons', () => {
    observeWidth(PHONE_CONTAINER);
    renderBoard();
    const panel = screen.getByRole('region', { name: `Cung ${MENH.name}` });

    expect(within(panel).queryAllByRole('button')).toEqual([]);
  });

  it('lays the board out before the first resize notification, so nothing below it shifts', () => {
    observeNothingUntilLaterWithLayoutWidth(PHONE_CONTAINER);
    renderBoard();

    expect(screen.getAllByRole('button', { name: /^Cung / })).toHaveLength(CHART.cungs.length);
  });
});
