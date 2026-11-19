import { fireEvent, screen, within } from '@testing-library/react';
import type { KienThucSearchItem } from '@org/shared-contracts';
import { FOCUS_RING_CLASS } from '@/design-system';
import { renderAtRoute } from '@/test-utils/render-at-route';
import { FIXTURE_SOURCE } from '../__fixtures__/fixture-source';
import lessonTuVi from '../__fixtures__/bai-tu-vi-la-gi.json';
import { ProseProvider } from './prose-context';
import { ProseParagraph } from './prose-paragraph';

const FIRST_PARAGRAPH = lessonTuVi.sections[0].paragraphs[0];
const THIEN_CO_SUMMARY = 'Tóm tắt mẫu của trang Sao Thiên Cơ.';
const FORBIDDEN_CLASS_PREFIXES: readonly string[] = ['backdrop-', 'animate-'];

type SearchIndexLoaderMock = jest.Mock<Promise<readonly KienThucSearchItem[]>, []>;

async function renderParagraph(): Promise<SearchIndexLoaderMock> {
  const loadSearchIndex: SearchIndexLoaderMock = jest.fn(() => FIXTURE_SOURCE.loadSearchIndex());
  await renderAtRoute({
    path: '/x',
    routePath: '/x',
    element: (
      <ProseProvider manifest={FIXTURE_SOURCE.loadManifest()} loadSearchIndex={loadSearchIndex}>
        <ProseParagraph text={FIRST_PARAGRAPH} />
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
