import { screen, within } from '@testing-library/react';
import { saoFacts } from '@org/shared-kien-thuc';
import { FOCUS_RING_CLASS } from '@/design-system';
import { renderAtRoute } from '@/test-utils/render-at-route';
import { FIXTURE_SOURCE } from '../__fixtures__/fixture-source';
import { EntryFactsKind, entryFacts } from '../entry-facts';
import type { EntryFacts } from '../entry-facts';
import { FactsBlock } from './facts-block';

const CHI_COUNT = 12;
const CAN_COUNT = 10;
const ROUTE_PATH = '/kien-thuc/facts';
const NO_CLAIM = 'không có trong bảng';
const FADED_TEXT_CLASS = /^text-[a-z-]+\/\d+$/;
const OPACITY_CLASS = /^opacity-/;

async function renderFacts(facts: EntryFacts): Promise<HTMLElement> {
  const { container } = await renderAtRoute({
    path: ROUTE_PATH,
    routePath: ROUTE_PATH,
    element: <FactsBlock facts={facts} manifest={FIXTURE_SOURCE.loadManifest()} />,
  });
  return container;
}

function factValue(term: string): HTMLElement {
  const dt = screen.getByText(term, { selector: 'dt' });
  const dd = dt.nextElementSibling;
  if (!(dd instanceof HTMLElement) || dd.tagName !== 'DD') {
    throw new Error(`The fact "${term}" has no value`);
  }
  return dd;
}

function rows(term: string): readonly HTMLElement[] {
  return within(factValue(term)).getAllByRole('listitem');
}

function rowStartingWith(term: string, label: string): HTMLElement {
  const row = rows(term).find((item) => item.firstElementChild?.textContent === label);
  if (!row) {
    throw new Error(`The fact "${term}" has no row for "${label}"`);
  }
  return row;
}

describe('FactsBlock', () => {
  it('gives a chính tinh its hành, chòm and twelve bậc', async () => {
    await renderFacts(entryFacts('sao/thien-co'));

    expect(factValue('Hành').textContent).toBe('Mộc');
    expect(factValue('Chòm').textContent).toBe('Tử Vi');
    expect(rows('Bậc theo địa chi')).toHaveLength(CHI_COUNT);
    expect(rowStartingWith('Bậc theo địa chi', 'Dần').lastElementChild?.textContent).toBe('Hãm');
    expect(screen.queryByText('Hung tinh', { selector: 'dt' })).toBeNull();
  });

  it('shows a dash, not a blank, where a partial row has no bậc', async () => {
    await renderFacts(entryFacts('sao/dia-kiep'));

    const cells = rows('Bậc theo địa chi');
    const unrated = cells.filter((cell) => cell.firstElementChild?.textContent !== 'Dần');

    expect(factValue('Hung tinh').textContent).toBe('Có');
    expect(cells).toHaveLength(CHI_COUNT);
    expect(rowStartingWith('Bậc theo địa chi', 'Dần').lastElementChild?.textContent).toBe('Đắc');
    expect(unrated).toHaveLength(CHI_COUNT - 1);
    unrated.forEach((cell) => {
      expect(cell.querySelector('[aria-hidden="true"]')?.textContent).toBe('—');
      expect(cell.querySelector('.sr-only')?.textContent).toBe(NO_CLAIM);
    });
  });

  it('lays the twelve bậc out in two rows on a phone and one from sm', async () => {
    await renderFacts(entryFacts('sao/thien-co'));

    const grid = within(factValue('Bậc theo địa chi')).getByRole('list');

    expect(grid.className.split(' ')).toEqual(
      expect.arrayContaining(['grid-cols-6', 'sm:grid-cols-12']),
    );
  });

  it('omits the bậc row for a star the tables leave out', async () => {
    await renderFacts(entryFacts('sao/ta-phu'));

    expect(factValue('Hành').textContent).toBe('Thổ');
    expect(factValue('Hung tinh').textContent).toBe('Không');
    expect(screen.queryByText('Bậc theo địa chi', { selector: 'dt' })).toBeNull();
  });

  it('lists the star each can turns into Hóa Kỵ', async () => {
    await renderFacts({ kind: EntryFactsKind.Sao, facts: saoFacts('Hóa Kỵ') });

    expect(rows('Hóa theo can năm')).toHaveLength(CAN_COUNT);
    expect(rowStartingWith('Hóa theo can năm', 'Giáp').lastElementChild?.textContent).toBe(
      'Thái Dương',
    );
  });

  it("links a cung's partners when they are published", async () => {
    await renderFacts(entryFacts('cung/menh'));

    const doiCung = within(factValue('Đối cung')).getByRole('link', { name: 'Thiên Di' });
    const tamHop = factValue('Tam hợp');

    expect(doiCung.getAttribute('href')).toBe('/kien-thuc/cung/thien-di');
    FOCUS_RING_CLASS.split(' ').forEach((token) => expect(doiCung.className).toContain(token));
    expect(within(tamHop).queryAllByRole('link')).toEqual([]);
    expect(within(tamHop).getByText('Quan Lộc')).toBeTruthy();
    expect(within(tamHop).getByText('Tài Bạch')).toBeTruthy();
  });

  it('draws no facts for a term', async () => {
    const container = await renderFacts(entryFacts('thuat-ngu/can'));

    expect(container.querySelector('dl')).toBeNull();
    expect(screen.queryByText('Dữ kiện từ lá số')).toBeNull();
  });

  it('sits on day-200 under its own heading and fades no text', async () => {
    await renderFacts(entryFacts('sao/dia-kiep'));

    const heading = screen.getByRole('heading', { level: 2, name: 'Dữ kiện từ lá số' });
    const root = heading.closest('section');
    if (!root) {
      throw new Error('The facts heading is not inside a section');
    }
    const tokens = [root, ...root.querySelectorAll('*')].flatMap((node) =>
      [...node.classList].map(String),
    );

    expect(root.className.split(' ')).toContain('bg-day-200');
    expect(root.querySelector('dl')).not.toBeNull();
    expect(tokens.filter((token) => FADED_TEXT_CLASS.test(token))).toEqual([]);
    expect(tokens.filter((token) => OPACITY_CLASS.test(token))).toEqual([]);
  });
});
