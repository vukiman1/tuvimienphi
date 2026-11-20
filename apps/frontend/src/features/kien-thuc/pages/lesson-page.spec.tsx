import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  useParams,
} from '@tanstack/react-router';
import type { ContentSection, LessonFile } from '@org/shared-contracts';
import { CHAPTER_TONE_CLASS, ChapterTone, FOCUS_RING_CLASS } from '@/design-system';
import { focusHashTargetOnRender } from '@/app/focus-hash-target-on-render';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderAtRoute } from '@/test-utils/render-at-route';
import { useAuthStore } from '@/stores/auth-store';
import {
  stubIntersectionObserver,
  type IntersectionObserverStub,
} from '@/test-utils/stub-intersection-observer';
import { FIXTURE_SOURCE } from '../__fixtures__/fixture-source';
import { lessonPath } from '../kien-thuc-paths';
import {
  clearLocalProgress,
  markLessonRead,
  readLocalProgress,
} from '../progress/local-progress-store';
import { LessonPage } from './lesson-page';

const LESSON_ROUTE_PATH = '/kien-thuc/$slug';
const STEP_ONE_SLUGS: readonly string[] = [
  'tu-vi-la-gi',
  'la-so-tu-vi-gom-nhung-gi',
  'am-duong-ngu-hanh-co-ban',
];
const SECOND_SECTION: ContentSection = {
  heading: 'Mục thứ hai',
  paragraphs: ['Đoạn của mục thứ hai, chỉ dùng trong kiểm thử.'],
};
const SAMPLE_CAPTION = 'Lá số mẫu: nam, sinh ngày 22/3/1987 dương lịch, giờ Thìn';
const RESERVED_HEIGHT_CLASS = /(^|:)min-h-/;
const FADED_TEXT_CLASS = /^text-[a-z-]+\/\d+$/;
const OPACITY_CLASS = /^opacity-/;
const FORBIDDEN_CLASS_PREFIXES: readonly string[] = ['animate-', 'backdrop-'];
const BELOW_THE_PROBE_PX = 1000;
const PASSED_THE_PROBE_PX = 40;
const SCROLLED_AWAY_PX = -400;
const RECT_SIZE_PX = 100;

let observer: IntersectionObserverStub;
let sectionTopsById: Readonly<Record<string, number>> = {};

function stubSectionTops(): void {
  jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function boundsOf(
    this: HTMLElement,
  ): DOMRect {
    const top = sectionTopsById[this.id] ?? BELOW_THE_PROBE_PX;
    return new DOMRect(0, top, RECT_SIZE_PX, RECT_SIZE_PX);
  });
}

async function fixtureLesson(slug: string): Promise<LessonFile> {
  const lesson = await FIXTURE_SOURCE.loadLesson(slug);
  if (!lesson) {
    throw new Error(`No fixture lesson "${slug}"`);
  }
  return lesson;
}

async function withSecondSection(slug: string): Promise<LessonFile> {
  const lesson = await fixtureLesson(slug);
  return { ...lesson, sections: [...lesson.sections, SECOND_SECTION] };
}

async function renderLesson(lessonOrSlug: LessonFile | string): Promise<HTMLElement> {
  const lesson =
    typeof lessonOrSlug === 'string' ? await fixtureLesson(lessonOrSlug) : lessonOrSlug;
  const { container } = await renderAtRoute({
    path: lessonPath(lesson.slug),
    routePath: LESSON_ROUTE_PATH,
    element: (
      <LessonPage
        lesson={lesson}
        manifest={FIXTURE_SOURCE.loadManifest()}
        loadSearchIndex={FIXTURE_SOURCE.loadSearchIndex}
      />
    ),
  });
  await screen.findByRole('heading', { level: 1 });
  return container;
}

async function prerenderLesson(slug: string): Promise<HTMLElement> {
  const lesson = await fixtureLesson(slug);
  const rootRoute = createRootRoute();
  const pageRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: LESSON_ROUTE_PATH,
    component: () => (
      <LessonPage
        lesson={lesson}
        manifest={FIXTURE_SOURCE.loadManifest()}
        loadSearchIndex={FIXTURE_SOURCE.loadSearchIndex}
      />
    ),
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([pageRoute]),
    history: createMemoryHistory({ initialEntries: [lessonPath(slug)] }),
  });
  await router.load();
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const container = document.createElement('div');
  container.innerHTML = renderToString(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return container;
}

function classTokens(element: Element): readonly string[] {
  return [element, ...element.querySelectorAll('*')].flatMap((node) =>
    [...node.classList].map(String),
  );
}

function isBefore(first: Node, second: Node): boolean {
  return (first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
}

function trackItems(): readonly HTMLElement[] {
  return within(screen.getByRole('list', { name: 'Lộ trình' })).getAllByRole('listitem');
}

function endCard(name: string): HTMLElement {
  return screen.getByRole('region', { name });
}

function currentTocLink(): string | null {
  const toc = screen.getByRole('navigation', { name: 'Trong bài' });
  const current = within(toc)
    .getAllByRole('link')
    .filter((link) => link.getAttribute('aria-current') === 'location');
  return current.length === 1 ? current[0].textContent : null;
}

interface LessonBySlugProps {
  readonly lessons: ReadonlyMap<string, LessonFile>;
}

function LessonBySlug({ lessons }: LessonBySlugProps): ReactElement {
  const { slug } = useParams({ strict: false });
  const lesson = slug === undefined ? undefined : lessons.get(slug);
  if (!lesson) {
    throw new Error(`No fixture lesson "${slug ?? ''}"`);
  }
  return (
    <LessonPage
      lesson={lesson}
      manifest={FIXTURE_SOURCE.loadManifest()}
      loadSearchIndex={FIXTURE_SOURCE.loadSearchIndex}
    />
  );
}

function hasStateBar(link: HTMLElement): boolean {
  return [...link.querySelectorAll('[aria-hidden="true"]')].some((node) =>
    node.classList.contains('inset-ring-gold'),
  );
}

beforeEach(() => {
  clearLocalProgress();
  useAuthStore.setState({ user: null, isInitializing: true });
  observer = stubIntersectionObserver();
  sectionTopsById = {};
  stubSectionTops();
});

afterEach(() => {
  observer.restore();
  jest.restoreAllMocks();
});

describe('LessonPage', () => {
  it('opens with a Night hero holding the pill, the h1 and the meta line', async () => {
    await renderLesson('tu-vi-la-gi');

    const headings = screen.getAllByRole('heading', { level: 1 });
    const hero = headings[0].closest('section');
    if (!hero) {
      throw new Error('The h1 is not inside a section');
    }
    const pill = within(hero).getByText('Bước 1/6 · Tử vi là gì');
    const meta = within(hero).getByText(
      (_, element) =>
        element?.tagName === 'P' &&
        element.textContent === 'Bài 1/3 · 3 phút đọc · Cập nhật 01/01/2026 · Biên soạn: Admin',
    );

    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe('Tử vi là gì');
    expect(hero.className.split(' ')).toContain('bg-night');
    expect(hero.querySelector('time')?.getAttribute('datetime')).toBe('2026-01-01');
    expect(isBefore(pill, headings[0])).toBe(true);
    expect(isBefore(headings[0], meta)).toBe(true);
    expect(isBefore(meta, screen.getByRole('list', { name: 'Lộ trình' }))).toBe(true);
  });

  it('shows the breadcrumb its JSON-LD describes before the h1', async () => {
    await renderLesson('tu-vi-la-gi');

    const breadcrumb = screen.getByRole('navigation', { name: 'Đường dẫn' });
    const items = within(breadcrumb).getAllByRole('listitem');

    expect(items.map((item) => item.textContent?.replace('›', '').trim())).toEqual([
      'Kiến thức',
      'Tử vi là gì',
    ]);
    expect(within(breadcrumb).getByRole('link', { name: 'Kiến thức' }).getAttribute('href')).toBe(
      '/kien-thuc',
    );
    expect(isBefore(breadcrumb, screen.getByRole('heading', { level: 1 }))).toBe(true);
  });

  it("draws six numbered track points with this lesson's step current", async () => {
    await renderLesson('tu-vi-la-gi');

    const [current, ...others] = trackItems();

    expect(others).toHaveLength(5);
    expect(current.getAttribute('data-status')).toBe('current');
    expect(classTokens(current)).toContain('bg-gold');
    expect(current.querySelector('[aria-hidden="true"]')?.textContent).toBe('1');
    expect(current.querySelector('.sr-only')?.textContent).toBe('Bước 1: Tử vi là gì, đang xem');
    others.forEach((item, index) => {
      expect(item.getAttribute('data-status')).toBe('unread');
      expect(classTokens(item)).toContain('inset-ring-1');
      expect(classTokens(item)).not.toContain('bg-gold');
      expect(item.querySelector('[aria-hidden="true"]')?.textContent).toBe(String(index + 2));
      expect(item.querySelector('.sr-only')?.textContent).toMatch(/, chưa đọc$/);
    });
  });

  it('marks finished steps on the track with a check after mount', async () => {
    STEP_ONE_SLUGS.forEach(markLessonRead);

    await renderLesson('12-cung-tu-vi');

    await waitFor(() => expect(trackItems()[0].getAttribute('data-status')).toBe('read'));
    const [read, current] = trackItems();
    expect(classTokens(read)).toEqual(expect.arrayContaining(['inset-ring-gold', 'bg-gold']));
    expect(read.querySelector('svg')).toBeTruthy();
    expect(read.querySelector('[aria-hidden="true"]')?.textContent).toBe('');
    expect(read.querySelector('.sr-only')?.textContent).toBe('Bước 1: Tử vi là gì, đã đọc');
    expect(current.getAttribute('data-status')).toBe('current');
  });

  it('sets each section under a starred serif h2 with a stable anchor', async () => {
    const lesson = await withSecondSection('tu-vi-la-gi');
    await renderLesson(lesson);

    const sections = [...document.querySelectorAll<HTMLElement>('section[id^="muc-"]')];

    expect(sections).toHaveLength(lesson.sections.length);
    sections.forEach((section, index) => {
      const headings = within(section).getAllByRole('heading', { level: 2 });
      expect(section.id).toBe(`muc-${index + 1}`);
      expect(section.className.split(' ')).toContain('scroll-mt-6');
      expect(headings).toHaveLength(1);
      expect(headings[0].textContent).toBe(lesson.sections[index].heading);
      expect(headings[0].className.split(' ')).toContain('font-emphasis');
      expect(headings[0].previousElementSibling?.getAttribute('aria-hidden')).toBe('true');
    });
  });

  it('lists the sections in "Trong bài" from lg', async () => {
    const lesson = await withSecondSection('tu-vi-la-gi');
    await renderLesson(lesson);

    const toc = screen.getByRole('navigation', { name: 'Trong bài' });
    const [first, ...rest] = within(toc).getAllByRole('link');

    expect(toc.className.split(' ')).toEqual(expect.arrayContaining(['hidden', 'lg:block']));
    expect([first, ...rest].map((link) => link.getAttribute('href'))).toEqual([
      '/kien-thuc/tu-vi-la-gi#muc-1',
      '/kien-thuc/tu-vi-la-gi#muc-2',
    ]);
    expect(first.getAttribute('aria-current')).toBe('location');
    expect(first.className.split(' ')).toContain('font-bold');
    expect(hasStateBar(first)).toBe(true);
    rest.forEach((link) => {
      expect(link.getAttribute('aria-current')).toBeNull();
      expect(link.className.split(' ')).not.toContain('font-bold');
      expect(hasStateBar(link)).toBe(false);
    });
  });

  it('jumps to a section from "Trong bài" without leaving the lesson', async () => {
    const lesson = await withSecondSection('tu-vi-la-gi');
    const { router } = await renderAtRoute({
      path: lessonPath(lesson.slug),
      routePath: LESSON_ROUTE_PATH,
      element: (
        <LessonPage
          lesson={lesson}
          manifest={FIXTURE_SOURCE.loadManifest()}
          loadSearchIndex={FIXTURE_SOURCE.loadSearchIndex}
        />
      ),
    });
    focusHashTargetOnRender(router);
    const toc = await screen.findByRole('navigation', { name: 'Trong bài' });

    fireEvent.click(within(toc).getByRole('link', { name: SECOND_SECTION.heading }));

    await waitFor(() => expect(router.state.location.hash).toBe('muc-2'));
    expect(router.state.location.pathname).toBe('/kien-thuc/tu-vi-la-gi');
    await waitFor(() => expect(document.activeElement?.id).toBe('muc-2'));
  });

  it('moves the current section as the reader scrolls past it', async () => {
    await renderLesson(await withSecondSection('tu-vi-la-gi'));
    await waitFor(() => expect(currentTocLink()).toBe('Mục mẫu'));

    sectionTopsById = { 'muc-1': SCROLLED_AWAY_PX, 'muc-2': PASSED_THE_PROBE_PX };
    fireEvent.scroll(window);

    await waitFor(() => expect(currentTocLink()).toBe(SECOND_SECTION.heading));
  });

  it('picks the section already in view on mount without a scroll', async () => {
    sectionTopsById = { 'muc-1': SCROLLED_AWAY_PX, 'muc-2': PASSED_THE_PROBE_PX };

    await renderLesson(await withSecondSection('tu-vi-la-gi'));

    await waitFor(() => expect(currentTocLink()).toBe(SECOND_SECTION.heading));
  });

  it('works the current section out again on the next lesson', async () => {
    const lessons = new Map(
      await Promise.all(
        ['tu-vi-la-gi', 'la-so-tu-vi-gom-nhung-gi'].map(
          async (slug): Promise<[string, LessonFile]> => [slug, await withSecondSection(slug)],
        ),
      ),
    );
    sectionTopsById = { 'muc-1': SCROLLED_AWAY_PX, 'muc-2': PASSED_THE_PROBE_PX };
    await renderAtRoute({
      path: lessonPath('tu-vi-la-gi'),
      routePath: LESSON_ROUTE_PATH,
      element: <LessonBySlug lessons={lessons} />,
    });
    await waitFor(() => expect(currentTocLink()).toBe(SECOND_SECTION.heading));

    sectionTopsById = {};
    fireEvent.click(within(endCard('Bài tiếp theo')).getByRole('link'));

    await screen.findByRole('heading', { level: 1, name: 'Một lá số gồm những gì' });
    await waitFor(() => expect(currentTocLink()).toBe('Mục mẫu'));
  });

  it('offers the next lesson', async () => {
    await renderLesson('tu-vi-la-gi');

    const card = endCard('Bài tiếp theo');

    expect(within(card).getByRole('link').getAttribute('href')).toBe(
      '/kien-thuc/la-so-tu-vi-gom-nhung-gi',
    );
    expect(within(card).getByRole('link').className.split(' ')).toContain('font-emphasis');
    expect(card.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(2);
  });

  it("offers the next step at a step's end", async () => {
    await renderLesson('am-duong-ngu-hanh-co-ban');

    const card = endCard('Bước tiếp theo');

    expect(within(card).getByText('Bước 2 · Mười hai cung')).toBeTruthy();
    expect(within(card).getByRole('link').getAttribute('href')).toBe('/kien-thuc/12-cung-tu-vi');
  });

  it('ends the path with the cast-your-chart call', async () => {
    await renderLesson('doc-la-so-cua-chinh-ban');

    const link = screen.getByRole('link', { name: 'Lập lá số và đọc theo những gì đã học' });

    expect(link.getAttribute('href')).toBe('/#lap-la-so');
    expect(screen.queryByText('Bài tiếp theo')).toBeNull();
    expect(screen.queryByText('Bước tiếp theo')).toBeNull();
  });

  it('links back to the previous lesson', async () => {
    await renderLesson('la-so-tu-vi-gom-nhung-gi');

    const link = screen.getByRole('link', { name: '← Bài trước: Tử vi là gì' });

    expect(link.getAttribute('href')).toBe('/kien-thuc/tu-vi-la-gi');
  });

  it('offers no previous lesson on the first lesson', async () => {
    await renderLesson('tu-vi-la-gi');

    expect(screen.queryByRole('link', { name: /Bài trước/ })).toBeNull();
  });

  it('marks the lesson read only when its end card is half in view', async () => {
    await renderLesson('tu-vi-la-gi');

    expect(readLocalProgress().size).toBe(0);

    act(() => observer.reveal(endCard('Bài tiếp theo'), 0.6));

    expect(readLocalProgress().has('tu-vi-la-gi')).toBe(true);
  });

  it('closes with the methodology and the Night card after the end card', async () => {
    await renderLesson('tu-vi-la-gi');

    const card = endCard('Bài tiếp theo');
    const methodology = screen.getByRole('region', { name: 'Cách soạn bài' });
    const closing = screen.getByRole('heading', { name: 'Áp vào lá số của bạn' });

    expect(isBefore(card, methodology)).toBe(true);
    expect(isBefore(methodology, closing)).toBe(true);
    expect(methodology.textContent).not.toContain('Bảng dữ kiện');
    expect(methodology.textContent).not.toContain('Nội dung đã được đọc và duyệt');
  });

  it('puts the progress card after Bài tiếp theo and before the Night card', async () => {
    useAuthStore.setState({ user: null, isInitializing: false });
    markLessonRead('12-cung-tu-vi');
    await renderLesson('tu-vi-la-gi');

    const next = endCard('Bài tiếp theo');
    const card = await screen.findByRole('complementary', { name: /Bạn đã đọc/ });
    const closing = screen.getByRole('heading', { name: 'Áp vào lá số của bạn' });

    expect(isBefore(next, card)).toBe(true);
    expect(isBefore(card, closing)).toBe(true);
  });

  it('never puts the progress card among the prose sections', async () => {
    useAuthStore.setState({ user: null, isInitializing: false });
    markLessonRead('12-cung-tu-vi');
    const container = await renderLesson('tu-vi-la-gi');

    const card = await screen.findByRole('complementary', { name: /Bạn đã đọc/ });
    const sections = [...container.querySelectorAll('[id^="muc-"]')];

    sections.forEach((section) => expect(section.contains(card)).toBe(false));
    expect(isBefore(sections[sections.length - 1], card)).toBe(true);
  });

  it('renders term links through the prose renderer', async () => {
    await renderLesson('tu-vi-la-gi');

    expect(screen.getByRole('button', { name: 'Thiên Cơ' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Tử Vi' })).toBeNull();
    expect(screen.getByText(/Tử Vi/, { selector: 'p' })).toBeTruthy();
  });

  it('shows images only as lazy decoration, and the painting only from md', async () => {
    const container = await renderLesson('tu-vi-la-gi');

    const images = [...container.querySelectorAll('img')];
    const paintings = images.filter((image) =>
      image.getAttribute('src')?.includes('/kien-thuc/hero-night-'),
    );

    expect(paintings).toHaveLength(2);
    images.forEach((image) => {
      expect(image.getAttribute('alt')).toBe('');
      expect(image.getAttribute('loading')).toBe('lazy');
    });
    paintings.forEach((painting) => {
      expect(painting.closest('.hidden.md\\:block')).toBeTruthy();
    });
  });

  it('keeps every text at full strength and every control focusable in view', async () => {
    const container = await renderLesson('tu-vi-la-gi');

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

  it('shows the sample board after the first section of lesson 6.3', async () => {
    const container = await renderLesson('doc-la-so-cua-chinh-ban');

    const figure = await screen.findByRole('figure');
    const firstSection = container.querySelector<HTMLElement>('#muc-1');
    if (!firstSection) {
      throw new Error('Lesson 6.3 has no first section');
    }

    expect(within(figure).getByText(SAMPLE_CAPTION)).toBeTruthy();
    expect(firstSection.nextElementSibling).toBe(figure);
  });

  it('leaves no reserved space under the loaded sample board', async () => {
    await renderLesson('doc-la-so-cua-chinh-ban');

    const figure = await screen.findByRole('figure');

    expect([...figure.classList].filter((token) => RESERVED_HEIGHT_CLASS.test(token))).toEqual([]);
  });

  it('shows the sample board on a night panel so its night-styled labels keep contrast', async () => {
    await renderLesson('doc-la-so-cua-chinh-ban');

    const figure = await screen.findByRole('figure');

    expect([...figure.classList]).toEqual(
      expect.arrayContaining(CHAPTER_TONE_CLASS[ChapterTone.Night].split(' ')),
    );
  });

  it('keeps the board space reserved in the prerendered lesson, even once the board has loaded', async () => {
    await renderLesson('doc-la-so-cua-chinh-ban');
    await screen.findByRole('figure');

    const prerendered = await prerenderLesson('doc-la-so-cua-chinh-ban');
    const afterFirstSection = prerendered.querySelector('#muc-1')?.nextElementSibling;

    expect(prerendered.querySelector('figure')).toBeNull();
    expect(
      [...(afterFirstSection?.classList ?? [])].filter((token) =>
        RESERVED_HEIGHT_CLASS.test(token),
      ),
    ).not.toEqual([]);
  });

  it('shows no board on other lessons', async () => {
    await renderLesson('tu-vi-la-gi');

    expect(screen.queryByRole('figure')).toBeNull();
  });
});
