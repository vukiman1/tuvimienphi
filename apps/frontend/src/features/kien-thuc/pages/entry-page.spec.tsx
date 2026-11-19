import { cleanup, screen, within } from '@testing-library/react';
import { ContentKind } from '@org/shared-contracts';
import type { EntryFile, EntryKind } from '@org/shared-contracts';
import { FOCUS_RING_CLASS } from '@/design-system';
import { renderAtRoute } from '@/test-utils/render-at-route';
import { FIXTURE_SOURCE } from '../__fixtures__/fixture-source';
import { entryPath } from '../kien-thuc-paths';
import { EntryPage } from './entry-page';

const FACTS_LINE = 'Bảng dữ kiện được tính bằng bộ máy an sao của trang.';
const FADED_TEXT_CLASS = /^text-[a-z-]+\/\d+$/;
const OPACITY_CLASS = /^opacity-/;
const FORBIDDEN_CLASS_PREFIXES: readonly string[] = ['animate-', 'backdrop-'];

async function fixtureEntry(kind: EntryKind, slug: string): Promise<EntryFile> {
  const entry = await FIXTURE_SOURCE.loadEntry(kind, slug);
  if (!entry) {
    throw new Error(`No fixture entry "${kind}/${slug}"`);
  }
  return entry;
}

async function renderEntry(kind: EntryKind, slug: string): Promise<HTMLElement> {
  const entry = await fixtureEntry(kind, slug);
  const { container } = await renderAtRoute({
    path: entryPath(kind, slug),
    routePath: `/kien-thuc/${kind}/$slug`,
    element: (
      <EntryPage
        entry={entry}
        manifest={FIXTURE_SOURCE.loadManifest()}
        loadSearchIndex={FIXTURE_SOURCE.loadSearchIndex}
      />
    ),
  });
  await screen.findByRole('heading', { level: 1 });
  return container;
}

function isBefore(first: Node, second: Node): boolean {
  return (first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
}

describe('EntryPage', () => {
  it('opens with the breadcrumb, the h1 and the summary', async () => {
    const entry = await fixtureEntry(ContentKind.Sao, 'thien-co');
    await renderEntry(ContentKind.Sao, 'thien-co');

    const breadcrumb = screen.getByRole('navigation', { name: 'Đường dẫn' });
    const items = within(breadcrumb).getAllByRole('listitem');
    const heading = screen.getByRole('heading', { level: 1 });
    const hero = heading.closest('section');
    if (!hero) {
      throw new Error('The h1 is not inside a section');
    }
    const lead = within(hero).getByText(entry.summary);
    const meta = within(hero).getByText(
      (_, element) =>
        element?.tagName === 'P' &&
        element.textContent === 'Cập nhật 01/01/2026 · Biên soạn: Admin',
    );

    expect(items.map((item) => item.textContent?.replace('›', '').trim())).toEqual([
      'Kiến thức',
      'Chính tinh',
      'Sao Thiên Cơ',
    ]);
    expect(within(breadcrumb).getByRole('link', { name: 'Chính tinh' }).getAttribute('href')).toBe(
      '/kien-thuc/sao',
    );
    expect(items[2].getAttribute('aria-current')).toBe('page');
    expect(heading.textContent).toBe('Sao Thiên Cơ');
    expect(hero.className.split(' ')).toContain('bg-night');
    expect(hero.querySelector('time')?.getAttribute('datetime')).toBe('2026-01-01');
    expect(isBefore(breadcrumb, heading)).toBe(true);
    expect(isBefore(heading, lead)).toBe(true);
    expect(isBefore(lead, meta)).toBe(true);
  });

  it('shows the facts before the prose', async () => {
    await renderEntry(ContentKind.Sao, 'thien-co');

    const facts = screen.getByRole('heading', { level: 2, name: 'Dữ kiện từ lá số' });
    const prose = screen.getByRole('heading', { level: 2, name: 'Mục mẫu' });

    expect(isBefore(facts, prose)).toBe(true);
    expect(prose.className.split(' ')).toContain('font-display');
  });

  it('leads back to the lesson that teaches the entry when it is published', async () => {
    await renderEntry(ContentKind.Cung, 'menh');

    const link = screen.getByRole('link', { name: 'Học trong Bước 2: Mười hai cung →' });

    expect(link.getAttribute('href')).toBe('/kien-thuc/12-cung-tu-vi');
    expect(isBefore(screen.getByRole('heading', { level: 2, name: 'Mục mẫu' }), link)).toBe(true);
  });

  it('offers no lesson link while that lesson is unpublished', async () => {
    await renderEntry(ContentKind.Sao, 'thien-co');

    expect(screen.queryByText(/Học trong/)).toBeNull();
  });

  it('lists related entries of the same kind', async () => {
    await renderEntry(ContentKind.Sao, 'thien-co');

    const related = screen.getByRole('region', { name: 'Mục liên quan' });
    const links = within(related).getAllByRole('link');

    expect(links.map((link) => link.textContent)).toEqual(['Sao Tả Phù', 'Sao Địa Kiếp']);
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/kien-thuc/sao/ta-phu',
      '/kien-thuc/sao/dia-kiep',
    ]);
  });

  it('closes with related entries, the methodology and the Night card', async () => {
    await renderEntry(ContentKind.Cung, 'menh');

    const lessonLink = screen.getByRole('link', { name: /Học trong/ });
    const related = screen.getByRole('region', { name: 'Mục liên quan' });
    const methodology = screen.getByRole('region', { name: 'Cách soạn bài' });
    const closing = screen.getByRole('heading', { name: 'Áp vào lá số của bạn' });

    expect(isBefore(lessonLink, related)).toBe(true);
    expect(isBefore(related, methodology)).toBe(true);
    expect(isBefore(methodology, closing)).toBe(true);
    expect(methodology.textContent).not.toContain('Nội dung đã được đọc và duyệt');
  });

  it('credits the engine on pages with facts only', async () => {
    await renderEntry(ContentKind.Sao, 'thien-co');
    expect(screen.getByRole('region', { name: 'Cách soạn bài' }).textContent).toContain(FACTS_LINE);

    cleanup();
    await renderEntry(ContentKind.ThuatNgu, 'can');
    expect(screen.queryByText('Dữ kiện từ lá số')).toBeNull();
    expect(screen.getByRole('region', { name: 'Cách soạn bài' }).textContent).not.toContain(
      FACTS_LINE,
    );
  });

  it('renders no images', async () => {
    const container = await renderEntry(ContentKind.Sao, 'dia-kiep');

    expect(container.querySelector('img')).toBeNull();
  });

  it('keeps every text at full strength and every control focusable in view', async () => {
    const container = await renderEntry(ContentKind.Cung, 'menh');

    const visible = [...container.querySelectorAll('*')].filter(
      (element) => !element.closest('[aria-hidden="true"]'),
    );
    const tokens = visible.flatMap((element) => [...element.classList].map(String));

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
