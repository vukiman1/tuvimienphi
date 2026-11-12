import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { StoryProvider } from '@/design-system';
import { CHAPTER_LABELS, KNOWLEDGE, MAP, TRUTHS, TURN } from '@/features/home/home-content';
import { TET_HUB_LINK_LABEL } from '@/features/tet-hub/tet-hub-paths';
import { HomePage } from './home-page';

const HIDDEN_CLASS = /(^|\s|:)(hidden|opacity-0|invisible)(\s|$)/;

async function renderHome(): Promise<void> {
  const rootRoute = createRootRoute({
    component: () => (
      <StoryProvider>
        <HomePage />
      </StoryProvider>
    ),
  });
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  await router.load();
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  await screen.findByRole('heading', { level: 1 });
}

class NeverIntersectingObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '';
  readonly scrollMargin = '';
  readonly thresholds: readonly number[] = [];
  readonly observe = jest.fn();
  readonly unobserve = jest.fn();
  readonly disconnect = jest.fn();
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

function expectVisible(element: HTMLElement): void {
  let current: HTMLElement | null = element;
  while (current !== null) {
    expect(current.className).not.toMatch(HIDDEN_CLASS);
    expect(current.style.display).not.toBe('none');
    current = current.parentElement;
  }
}

describe('HomePage', () => {
  afterEach(() => {
    Reflect.deleteProperty(window, 'IntersectionObserver');
  });

  it('has a single h1 that names the main action', async () => {
    await renderHome();

    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe('Lập lá số tử vi');
  });

  it('tells the story in seven chapters, in order, labelled for the rail', async () => {
    await renderHome();

    const rail = screen.getByRole('navigation', { name: 'Các chương' });
    expect(
      within(rail)
        .getAllByRole('link')
        .map((link) => link.getAttribute('aria-label')),
    ).toEqual(Object.values(CHAPTER_LABELS));
  });

  it('shows every map statement and every truth before any scrolling', async () => {
    await renderHome();

    for (const statement of MAP.statements) {
      expectVisible(screen.getByText(statement.description));
    }
    for (const point of TRUTHS.points) {
      expectVisible(screen.getByText(point.description));
    }
  });

  it('shows every article before any scrolling, with no reveal holding it back', async () => {
    Object.defineProperty(window, 'IntersectionObserver', {
      configurable: true,
      writable: true,
      value: NeverIntersectingObserver,
    });
    await renderHome();

    expectVisible(screen.getByText(KNOWLEDGE.featured.excerpt));
    for (const article of KNOWLEDGE.more) {
      expectVisible(screen.getByText(article.title));
    }
  });

  it('shows the turning-point sentence at full strength before any scrolling', async () => {
    await renderHome();

    const heading = screen.getByRole('heading', { name: TURN.sentence });
    for (const word of heading.querySelectorAll('span')) {
      expect(word.style.opacity).toBe('');
    }
  });

  it('shows the birth date assembled before any scrolling', async () => {
    await renderHome();

    const numeral = screen.getByRole('img', { name: '12 tháng 03 năm 1995' });
    for (const part of numeral.querySelectorAll('span')) {
      expect(part.style.transform).toBe('');
    }
  });

  it('sends the hero CTA and the skip link to the birth form chapter', async () => {
    await renderHome();

    expect(screen.getByRole('link', { name: /LẬP LÁ SỐ CỦA BẠN/ }).getAttribute('href')).toBe(
      '/#lap-la-so',
    );
    expect(screen.getByRole('link', { name: /Bỏ qua câu chuyện/ }).getAttribute('href')).toBe(
      '/#lap-la-so',
    );
    const formChapter = document.getElementById('lap-la-so');
    if (formChapter === null) {
      throw new Error('The birth form chapter #lap-la-so is missing');
    }
    expect(within(formChapter).getByRole('button', { name: /lập lá số/i })).toBeTruthy();
  });

  it.each([/LẬP LÁ SỐ CỦA BẠN/, /Bỏ qua câu chuyện/])(
    'moves keyboard focus to the birth form chapter when %s is activated',
    async (name) => {
      await renderHome();

      fireEvent.click(screen.getByRole('link', { name }));

      await waitFor(() => expect(document.activeElement?.id).toBe('lap-la-so'));
    },
  );

  it('links each article to its page, or to the library when it has none, and keeps the Tết hub link', async () => {
    await renderHome();

    expect(screen.getByRole('link', { name: /Đại vận là gì\?/ }).getAttribute('href')).toBe(
      '/kien-thuc/cach-xem-dai-van',
    );
    expect(
      screen.getByRole('link', { name: /Tuần và Triệt trong lá số tử vi/ }).getAttribute('href'),
    ).toBe('/kien-thuc');
    expect(screen.getByRole('link', { name: new RegExp(TET_HUB_LINK_LABEL) })).toBeTruthy();
  });
});
