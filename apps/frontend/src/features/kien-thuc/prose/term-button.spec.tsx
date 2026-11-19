import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import type { ReactElement } from 'react';
import { useRouterState } from '@tanstack/react-router';
import type { KienThucSearchItem } from '@org/shared-contracts';
import { FOCUS_RING_CLASS } from '@/design-system';
import { renderAtRoute } from '@/test-utils/render-at-route';
import { FIXTURE_SOURCE } from '../__fixtures__/fixture-source';
import lessonTuVi from '../__fixtures__/bai-tu-vi-la-gi.json';
import { ProseProvider } from './prose-context';
import { ProseParagraph } from './prose-paragraph';

const FIRST_PARAGRAPH = lessonTuVi.sections[0].paragraphs[0];
const THIEN_CO_SUMMARY = 'Tóm tắt mẫu của trang Sao Thiên Cơ.';
const LESSON_PATH = '/kien-thuc/tu-vi-la-gi';
const LESSON_ROUTE_PATH = '/kien-thuc/$slug';
const NEXT_LESSON_PATH = '/kien-thuc/12-cung-tu-vi';
const PATHNAME_TEST_ID = 'pathname';
const FORBIDDEN_CLASS_PREFIXES: readonly string[] = ['backdrop-', 'animate-'];

type SearchIndexLoaderMock = jest.Mock<Promise<readonly KienThucSearchItem[]>, []>;

function Pathname(): ReactElement {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return <output data-testid={PATHNAME_TEST_ID}>{pathname}</output>;
}

async function renderParagraph(loader?: SearchIndexLoaderMock): Promise<SearchIndexLoaderMock> {
  const loadSearchIndex: SearchIndexLoaderMock =
    loader ?? jest.fn(() => FIXTURE_SOURCE.loadSearchIndex());
  await renderAtRoute({
    path: LESSON_PATH,
    routePath: LESSON_ROUTE_PATH,
    element: (
      <ProseProvider manifest={FIXTURE_SOURCE.loadManifest()} loadSearchIndex={loadSearchIndex}>
        <ProseParagraph text={FIRST_PARAGRAPH} />
        <Pathname />
      </ProseProvider>
    ),
  });
  return loadSearchIndex;
}

function term(name: string): Promise<HTMLElement> {
  return screen.findByRole('button', { name });
}

function panelOf(button: HTMLElement): HTMLElement {
  const panel = document.getElementById(button.getAttribute('aria-controls') ?? '');
  if (!panel) {
    throw new Error(`No panel controlled by the term "${button.textContent ?? ''}"`);
  }
  return panel;
}

describe('TermButton', () => {
  it('puts a crawlable link in the closed panel', async () => {
    await renderParagraph();
    const button = await term('Thiên Cơ');
    const panel = panelOf(button);

    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(panel.hidden).toBe(true);
    const link = within(panel).getByRole('link', { name: 'Xem mục Sao Thiên Cơ →', hidden: true });
    expect(link.getAttribute('href')).toBe('/kien-thuc/sao/thien-co');
  });

  it('renders a link to an unpublished page as plain text', async () => {
    await renderParagraph();
    const button = await term('Thiên Cơ');

    expect(button.closest('p')?.textContent).toContain('Tử Vi');
    expect(screen.queryByRole('button', { name: 'Tử Vi' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Tử Vi', hidden: true })).toBeNull();
  });

  it('words a lesson link as a lesson', async () => {
    await renderParagraph();
    const panel = panelOf(await term('12 cung'));

    const link = within(panel).getByRole('link', {
      name: 'Đọc bài 12 cung trong lá số →',
      hidden: true,
    });
    expect(link.getAttribute('href')).toBe('/kien-thuc/12-cung-tu-vi');
  });

  it('shows the summary from the search index on open and loads it once', async () => {
    const loadSearchIndex = await renderParagraph();
    const button = await term('Thiên Cơ');
    const panel = panelOf(button);

    fireEvent.click(button);

    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(panel.hidden).toBe(false);
    expect(await within(panel).findByText(THIEN_CO_SUMMARY)).toBeTruthy();

    fireEvent.click(await term('12 cung'));
    expect(loadSearchIndex).toHaveBeenCalledTimes(1);
  });

  it('retries the search index on a later open after a failed load', async () => {
    const unhandled = jest.fn();
    process.on('unhandledRejection', unhandled);
    const loader: SearchIndexLoaderMock = jest
      .fn<Promise<readonly KienThucSearchItem[]>, []>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockImplementation(() => FIXTURE_SOURCE.loadSearchIndex());
    await renderParagraph(loader);
    const button = await term('Thiên Cơ');
    const panel = panelOf(button);

    fireEvent.click(button);
    await waitFor(() => expect(loader).toHaveBeenCalledTimes(1));
    await new Promise((resolve) => setTimeout(resolve, 0));
    fireEvent.click(button);
    fireEvent.click(button);

    expect(await within(panel).findByText(THIEN_CO_SUMMARY)).toBeTruthy();
    expect(loader).toHaveBeenCalledTimes(2);
    expect(unhandled).not.toHaveBeenCalled();
    process.off('unhandledRejection', unhandled);
  });

  it('keeps one term open at a time', async () => {
    await renderParagraph();
    const thienCo = await term('Thiên Cơ');
    const cung = await term('12 cung');

    fireEvent.click(thienCo);
    fireEvent.click(cung);

    expect(thienCo.getAttribute('aria-expanded')).toBe('false');
    expect(panelOf(thienCo).hidden).toBe(true);
    expect(cung.getAttribute('aria-expanded')).toBe('true');
    expect(panelOf(cung).hidden).toBe(false);
  });

  it('closes on Escape and returns focus to the term', async () => {
    await renderParagraph();
    const button = await term('Thiên Cơ');

    fireEvent.click(button);
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(panelOf(button).hidden).toBe(true);
    expect(document.activeElement).toBe(button);
  });

  it('closes when its panel link leads to another lesson on the same route', async () => {
    await renderParagraph();
    const button = await term('12 cung');
    const panel = panelOf(button);

    fireEvent.click(button);
    fireEvent.click(within(panel).getByRole('link', { name: 'Đọc bài 12 cung trong lá số →' }));

    await waitFor(() =>
      expect(screen.getByTestId(PATHNAME_TEST_ID).textContent).toBe(NEXT_LESSON_PATH),
    );
    expect(button.isConnected).toBe(true);
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(panel.hidden).toBe(true);
  });

  it('closes on an outside click and on Đóng', async () => {
    await renderParagraph();
    const button = await term('Thiên Cơ');
    const panel = panelOf(button);

    fireEvent.click(button);
    fireEvent.pointerDown(document.body);
    expect(panel.hidden).toBe(true);

    fireEvent.click(button);
    fireEvent.click(within(panel).getByRole('button', { name: 'Đóng' }));
    expect(panel.hidden).toBe(true);
  });

  it('marks the term by a dotted underline, not by colour alone', async () => {
    await renderParagraph();
    const tokens = (await term('Thiên Cơ')).className.split(' ');

    ['decoration-dotted', 'underline', 'text-ink', ...FOCUS_RING_CLASS.split(' ')].forEach(
      (token) => expect(tokens).toContain(token),
    );
  });

  it('is a bottom sheet below md and a popover from md', async () => {
    await renderParagraph();
    const panel = panelOf(await term('Thiên Cơ'));
    const tokens = panel.className.split(' ');
    const classNames = [panel, ...panel.querySelectorAll('*')].flatMap((element) =>
      element.className.split(' '),
    );

    ['fixed', 'bottom-0', 'z-60', 'pb-[env(safe-area-inset-bottom)]', 'md:absolute'].forEach(
      (token) => expect(tokens).toContain(token),
    );
    expect(panel.firstElementChild?.className.split(' ')).toContain('p-6');
    expect(
      classNames.filter((name) =>
        FORBIDDEN_CLASS_PREFIXES.some((prefix) => name.startsWith(prefix)),
      ),
    ).toEqual([]);
  });
});
