import { screen, within } from '@testing-library/react';
import { ContentKind } from '@org/shared-contracts';
import type { EntryKind } from '@org/shared-contracts';
import { FOCUS_RING_CLASS } from '@/design-system';
import { renderAtRoute } from '@/test-utils/render-at-route';
import { FIXTURE_SOURCE } from '../__fixtures__/fixture-source';
import { indexPath } from '../kien-thuc-paths';
import { loadIndexPage } from '../route-data/index-route';
import { KienThucPageStatus } from '../route-data/kien-thuc-page-status';
import { IndexPage } from './index-page';

const FADED_TEXT_CLASS = /^text-[a-z-]+\/\d+$/;
const OPACITY_CLASS = /^opacity-/;
const FORBIDDEN_CLASS_PREFIXES: readonly string[] = ['animate-', 'backdrop-'];

async function renderIndex(kind: EntryKind): Promise<HTMLElement> {
  const data = await loadIndexPage(kind, FIXTURE_SOURCE);
  if (data.status !== KienThucPageStatus.Found) {
    throw new Error(`The ${kind} index was not found`);
  }
  const { container } = await renderAtRoute({
    path: indexPath(kind),
    routePath: `/kien-thuc/${kind}`,
    element: <IndexPage data={data} />,
  });
  await screen.findByRole('heading', { level: 1 });
  return container;
}

function h2Names(): readonly (string | null)[] {
  return screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent);
}

function isBefore(first: Node, second: Node): boolean {
  return (first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
}

describe('IndexPage', () => {
  it('heads each group of stars with a focusable anchor', async () => {
    await renderIndex(ContentKind.Sao);

    const chinhTinh = screen.getByRole('heading', { level: 2, name: 'Chính tinh' });
    const phuTinh = screen.getByRole('heading', { level: 2, name: 'Phụ tinh' });

    expect(chinhTinh.id).toBe('chinh-tinh');
    expect(chinhTinh.tabIndex).toBe(-1);
    expect(phuTinh.id).toBe('phu-tinh');
    expect(phuTinh.tabIndex).toBe(-1);
    expect(isBefore(chinhTinh, phuTinh)).toBe(true);
    expect(screen.queryByRole('heading', { name: 'Tứ hóa' })).toBeNull();
  });

  it('lists each entry as a tile with its summary', async () => {
    await renderIndex(ContentKind.Sao);

    const tile = screen.getByRole('link', { name: /Sao Thiên Cơ/ });

    expect(tile.getAttribute('href')).toBe('/kien-thuc/sao/thien-co');
    expect(tile.textContent).toContain('Tóm tắt mẫu của trang Sao Thiên Cơ.');
  });

  it('lists the twelve cung without a group heading', async () => {
    await renderIndex(ContentKind.Cung);

    const tiles = screen
      .getAllByRole('link')
      .filter((link) => link.getAttribute('href')?.startsWith('/kien-thuc/cung/'));

    expect(screen.queryAllByRole('heading', { level: 2 })).toEqual([]);
    expect(tiles.map((tile) => tile.getAttribute('href'))).toEqual([
      '/kien-thuc/cung/menh',
      '/kien-thuc/cung/thien-di',
    ]);
  });

  it('puts ngũ hành before the glossary and strips letters that have entries', async () => {
    await renderIndex(ContentKind.ThuatNgu);

    const strip = screen.getByRole('navigation', { name: 'Theo chữ cái' });
    const glossaryLinks = within(strip).getAllByRole('link');
    const cuc = screen.getByRole('link', { name: /Cục/ });
    const can = screen.getByRole('link', { name: /Thiên can/ });

    expect(h2Names()).toEqual(['Ngũ hành', 'Thuật ngữ A–Z']);
    expect(glossaryLinks.map((link) => link.getAttribute('href'))).toEqual(['#chu-c', '#chu-t']);
    expect(document.getElementById('chu-c')?.tabIndex).toBe(-1);
    expect(isBefore(cuc, can)).toBe(true);
  });

  it('opens on a Night hero with a one-line lead', async () => {
    await renderIndex(ContentKind.Sao);

    const heading = screen.getByRole('heading', { level: 1 });
    const hero = heading.closest('section');

    expect(heading.textContent).toBe('Các sao trong tử vi');
    expect(hero?.className.split(' ')).toContain('bg-night');
    expect(hero?.querySelector('img')?.getAttribute('src')).toContain(
      '/kien-thuc/hero-night-1536.webp',
    );
    expect(
      within(hero ?? document.body).getByText(
        'Mỗi sao một trang: hành, nhóm sao và bậc ở từng địa chi.',
      ),
    ).toBeTruthy();
  });

  it('keeps every text at full strength and every control focusable in view', async () => {
    const container = await renderIndex(ContentKind.ThuatNgu);

    const visible = [...container.querySelectorAll('*')].filter(
      (element) => !element.closest('[aria-hidden="true"]'),
    );
    const tokens = visible.flatMap((element) => [...element.classList].map(String));

    expect(tokens.filter((token) => FADED_TEXT_CLASS.test(token))).toEqual([]);
    expect(tokens.filter((token) => OPACITY_CLASS.test(token))).toEqual([]);
    expect(
      tokens.filter((token) => FORBIDDEN_CLASS_PREFIXES.some((prefix) => token.startsWith(prefix))),
    ).toEqual([]);
    container.querySelectorAll('a, button').forEach((control) => {
      FOCUS_RING_CLASS.split(' ').forEach((token) => expect(control.className).toContain(token));
    });
  });
});
