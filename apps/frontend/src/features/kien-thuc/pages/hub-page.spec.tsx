import { cleanup, screen, within } from '@testing-library/react';
import type { KienThucManifest } from '@org/shared-contracts';
import { FOCUS_RING_CLASS } from '@/design-system';
import { renderAtRoute } from '@/test-utils/render-at-route';
import { FIXTURE_SOURCE } from '../__fixtures__/fixture-source';
import { hubHead } from '../head/hub-head';
import { clearLocalProgress, markLessonRead } from '../progress/local-progress-store';
import { publishedLessons } from '../published-pages';
import { loadHubPage } from '../route-data/hub-route';
import { HubPage } from './hub-page';

const HUB_PATH = '/kien-thuc';
const HUB_LEAD =
  'Mỗi bước vài bài ngắn, đọc theo thứ tự: từ lá số là gì đến đọc lá số của chính bạn.';
const STEP_ONE_SLUGS: readonly string[] = [
  'tu-vi-la-gi',
  'la-so-tu-vi-gom-nhung-gi',
  'am-duong-ngu-hanh-co-ban',
];
const STATUS_CELL_CLASSES: readonly string[] = ['w-28', 'sm:w-36'];
const BUTTON_BOX_CLASSES: readonly string[] = ['min-h-20', 'sm:min-h-13'];
const FADED_TEXT_CLASS = /^text-[a-z-]+\/\d+$/;
const OPACITY_CLASS = /^opacity-/;
const FORBIDDEN_CLASS_PREFIXES: readonly string[] = ['animate-', 'backdrop-'];

function fixtureManifest(): KienThucManifest {
  return loadHubPage(FIXTURE_SOURCE);
}

async function renderHub(manifest: KienThucManifest = fixtureManifest()): Promise<HTMLElement> {
  const { container } = await renderAtRoute({
    path: HUB_PATH,
    routePath: HUB_PATH,
    head: hubHead,
    element: <HubPage manifest={manifest} loadSearchIndex={FIXTURE_SOURCE.loadSearchIndex} />,
  });
  await screen.findByRole('heading', { level: 1 });
  return container;
}

function markRead(slugs: readonly string[]): void {
  slugs.forEach((slug) => markLessonRead(slug));
}

function stepRows(): readonly HTMLElement[] {
  return within(screen.getByRole('list', { name: 'Lộ trình' })).getAllByRole('link');
}

function rowCells(row: HTMLElement): readonly Element[] {
  return [...row.children].filter((child) => child.getAttribute('aria-hidden') !== 'true');
}

function stepNumber(row: HTMLElement): Element | undefined {
  return rowCells(row)[0];
}

function stepRow(number: string): HTMLElement {
  const row = stepRows().find((link) => stepNumber(link)?.textContent === number);
  if (!row) {
    throw new Error(`No step row "${number}"`);
  }
  return row;
}

function statusCell(row: HTMLElement): Element | undefined {
  const cells = rowCells(row);
  return cells[cells.length - 1];
}

function hasStateBar(row: HTMLElement): boolean {
  return [...row.querySelectorAll('[aria-hidden="true"]')].some((node) =>
    node.classList.contains('inset-ring-gold'),
  );
}

function heroLink(): HTMLElement {
  const hero = screen.getByRole('heading', { level: 1 }).closest('section');
  if (!hero) {
    throw new Error('The hub has no hero section');
  }
  const link = within(hero).getAllByRole('link')[0];
  if (!link) {
    throw new Error('The hub hero has no link');
  }
  return link;
}

beforeEach(() => {
  clearLocalProgress();
});

describe('HubPage', () => {
  it('opens with the Night hero, one accent and the start button', async () => {
    await renderHub();

    const heading = screen.getByRole('heading', { level: 1 });
    const hero = heading.closest('section');
    const accent = heading.querySelector('.italic');

    expect(heading.textContent).toBe('Đọc lá số trong 6 bước');
    expect(heading.querySelectorAll('.italic')).toHaveLength(1);
    expect(accent?.textContent).toBe('6 bước');
    expect(accent?.classList.contains('text-dawn')).toBe(true);
    expect(accent?.parentElement?.className.split(' ')).toContain('md:block');
    expect(hero?.classList.contains('bg-night')).toBe(true);
    expect(within(hero ?? document.body).getByText('Học tử vi từ đầu')).toBeTruthy();
    expect(within(hero ?? document.body).getByText(HUB_LEAD)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Bắt đầu bước 1' }).getAttribute('href')).toBe(
      '/kien-thuc/tu-vi-la-gi',
    );
    expect(hero?.contains(screen.getByRole('combobox'))).toBe(true);
  });

  it('lists only the steps that have lessons', async () => {
    await renderHub();

    const rows = stepRows();
    const numbers = rows.map(stepNumber);
    const stepOneMinutes = publishedLessons(fixtureManifest())
      .filter((lesson) => lesson.step === 1)
      .reduce((total, lesson) => total + lesson.readingMinutes, 0);

    expect(numbers.map((number) => number?.textContent)).toEqual(['01', '02', '06']);
    numbers.forEach((number) => {
      expect(number?.classList.contains('font-emphasis')).toBe(true);
      expect(number?.classList.contains('italic')).toBe(true);
    });
    expect(within(stepRow('01')).getByText(`3 bài · ${stepOneMinutes} phút`)).toBeTruthy();
    expect(
      within(stepRow('02')).getByText(
        'Mười hai cung, cung Mệnh và cung Thân, tam hợp và xung chiếu.',
      ),
    ).toBeTruthy();
    expect(stepRow('01').getAttribute('href')).toBe('/kien-thuc/tu-vi-la-gi');
  });

  it('renders the no-progress state first', async () => {
    await renderHub();

    expect(screen.queryByText('Đã đọc')).toBeNull();
    expect(screen.queryByText(/Đang học/)).toBeNull();
    expect(screen.queryByText(/Học tiếp/)).toBeNull();
    expect(stepRows().some(hasStateBar)).toBe(false);
  });

  it('marks read and current steps in words and shape', async () => {
    markRead(STEP_ONE_SLUGS);
    await renderHub();

    const readWords = within(stepRow('01')).getByText('Đã đọc');
    const disc = readWords.querySelector('.bg-gold');
    const currentRow = stepRow('02');

    expect(disc?.querySelector('svg')).toBeTruthy();
    expect(within(currentRow).getByText('Đang học 0/1')).toBeTruthy();
    expect(stepRows().filter(hasStateBar)).toEqual([currentRow]);
    expect(currentRow.getAttribute('href')).toBe('/kien-thuc/12-cung-tu-vi');
    expect(heroLink().textContent).toBe('Học tiếp: Bước 2 · Mười hai cung');
    expect(heroLink().getAttribute('href')).toBe('/kien-thuc/12-cung-tu-vi');
  });

  it('keeps the status box and the hero button box the same size in every state', async () => {
    await renderHub();
    const emptyStatus = statusCell(stepRow('01'))?.className;
    const emptyButtonBox = heroLink().parentElement?.className;
    cleanup();

    markRead(STEP_ONE_SLUGS);
    await renderHub();
    const readStatus = statusCell(stepRow('01'))?.className;
    const currentStatus = statusCell(stepRow('02'))?.className;
    const resumeButtonBox = heroLink().parentElement?.className;

    expect(emptyStatus?.split(' ')).toEqual(expect.arrayContaining(STATUS_CELL_CLASSES));
    expect(readStatus).toBe(emptyStatus);
    expect(currentStatus).toBe(emptyStatus);
    BUTTON_BOX_CLASSES.forEach((token) => {
      expect(emptyButtonBox?.split(' ')).toContain(token);
      expect(resumeButtonBox?.split(' ')).toContain(token);
    });
  });

  it('offers a review once every lesson is read', async () => {
    markRead(publishedLessons(fixtureManifest()).map((lesson) => lesson.slug));
    await renderHub();

    expect(heroLink().textContent).toBe('Đọc lại từ bước 1');
    expect(heroLink().getAttribute('href')).toBe('/kien-thuc/tu-vi-la-gi');
  });

  it('shows a tile only for groups that have entries', async () => {
    await renderHub();

    const reference = screen.getByRole('region', { name: 'Tra cứu' });
    const tiles = within(reference).getAllByRole('link');

    expect(within(reference).getByText('Khi đã quen, tra từng sao, từng cung.')).toBeTruthy();
    expect(tiles.map((tile) => [tile.textContent, tile.getAttribute('href')])).toEqual([
      ['Chính tinh · 1', '/kien-thuc/sao#chinh-tinh'],
      ['Phụ tinh · 2', '/kien-thuc/sao#phu-tinh'],
      ['2 cung', '/kien-thuc/cung'],
      ['Ngũ hành', '/kien-thuc/thuat-ngu#ngu-hanh'],
      ['Thuật ngữ A–Z', '/kien-thuc/thuat-ngu#thuat-ngu'],
    ]);
    expect(within(reference).queryByText(/Tứ hóa/)).toBeNull();
    tiles.forEach((tile) => {
      const emblem = tile.querySelector('img');
      expect(emblem?.getAttribute('alt')).toBe('');
      expect(emblem?.getAttribute('loading')).toBe('lazy');
      expect(emblem?.getAttribute('width')).toBe('256');
      expect(emblem?.getAttribute('height')).toBe('256');
    });
    expect(tiles[0].querySelector('img')?.getAttribute('src')).toContain(
      '/kien-thuc/emblems/chinh-tinh-256.webp',
    );
    expect(tiles[2].querySelector('img')?.getAttribute('src')).toContain(
      '/kien-thuc/emblems/cung-256.webp',
    );
  });

  it('drops the reference block when there are no entries', async () => {
    await renderHub({ ...fixtureManifest(), entries: [] });

    expect(screen.queryByRole('heading', { level: 2, name: 'Tra cứu' })).toBeNull();
    expect(screen.getByRole('heading', { level: 2, name: 'Lộ trình' })).toBeTruthy();
  });

  it('keeps the Tết hub link and ends on the Night card', async () => {
    const container = await renderHub();

    const sections = container.querySelectorAll('section');
    const lastSection = sections[sections.length - 1];

    expect(screen.getByRole('link', { name: /^Tử vi 2027 theo tuổi/ }).getAttribute('href')).toBe(
      '/kien-thuc/tu-vi-2027',
    );
    expect(lastSection?.classList.contains('bg-night')).toBe(true);
    expect(within(lastSection).getByText('Áp vào lá số của bạn')).toBeTruthy();
  });

  it('paints the hero and the closing band from md only, lazily', async () => {
    const container = await renderHub();

    const hero = screen.getByRole('heading', { level: 1 }).closest('section');
    const sections = container.querySelectorAll('section');
    const closing = sections[sections.length - 1];

    [hero, closing].forEach((band) => {
      const painting = band?.querySelector('img');
      expect(painting?.getAttribute('src')).toContain('/kien-thuc/hero-night-1536.webp');
      expect(painting?.getAttribute('srcset')).toContain('/kien-thuc/hero-night-768.webp 768w');
      expect(painting?.getAttribute('alt')).toBe('');
      expect(painting?.getAttribute('loading')).toBe('lazy');
      expect(painting?.closest('.hidden.md\\:block')).toBeTruthy();
    });
    expect(hero?.querySelector('img')?.className.split(' ')).toContain('right-0');
  });

  it('shows images only as decoration and fades no text', async () => {
    markRead(STEP_ONE_SLUGS);
    const container = await renderHub();

    const visible = [...container.querySelectorAll('*')].filter(
      (element) => !element.closest('[aria-hidden="true"]'),
    );
    const tokens = visible.flatMap((element) => [...element.classList].map(String));

    container.querySelectorAll('img').forEach((image) => {
      expect(image.getAttribute('alt')).toBe('');
      expect(image.getAttribute('loading')).toBe('lazy');
    });
    expect(tokens.filter((token) => FADED_TEXT_CLASS.test(token))).toEqual([]);
    expect(tokens.filter((token) => OPACITY_CLASS.test(token))).toEqual([]);
    expect(tokens).not.toContain('font-medium');
    expect(
      tokens.filter((token) => FORBIDDEN_CLASS_PREFIXES.some((prefix) => token.startsWith(prefix))),
    ).toEqual([]);
    container.querySelectorAll('a, button').forEach((control) => {
      FOCUS_RING_CLASS.split(' ').forEach((token) => expect(control.className).toContain(token));
    });
  });
});
