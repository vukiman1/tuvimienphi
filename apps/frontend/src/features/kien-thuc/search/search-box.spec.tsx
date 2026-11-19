import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import type { ReactElement } from 'react';
import { useRouterState } from '@tanstack/react-router';
import type { KienThucSearchItem } from '@org/shared-contracts';
import { FOCUS_RING_CLASS } from '@/design-system';
import { renderAtRoute } from '@/test-utils/render-at-route';
import { FIXTURE_SOURCE } from '../__fixtures__/fixture-source';
import { publishedLessons } from '../published-pages';
import type { PublishedLesson } from '../published-pages';
import { SearchBox } from './search-box';

const SEARCH_LABEL = 'Tra cứu kiến thức tử vi';
const PAGE_PATH = '/kien-thuc';
const PATHNAME_TEST_ID = 'pathname';
const FORBIDDEN_CLASS_PREFIXES: readonly string[] = ['backdrop-', 'animate-', 'transition'];

type SearchIndexLoaderMock = jest.Mock<Promise<readonly KienThucSearchItem[]>, []>;

function Pathname(): ReactElement {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return <output data-testid={PATHNAME_TEST_ID}>{pathname}</output>;
}

function firstLesson(): PublishedLesson | undefined {
  return publishedLessons(FIXTURE_SOURCE.loadManifest())[0];
}

async function renderSearch(loader?: SearchIndexLoaderMock): Promise<SearchIndexLoaderMock> {
  const loadSearchIndex = loader ?? jest.fn(() => FIXTURE_SOURCE.loadSearchIndex());
  await renderAtRoute({
    path: PAGE_PATH,
    routePath: '/kien-thuc/$',
    element: (
      <>
        <SearchBox loadSearchIndex={loadSearchIndex} firstLesson={firstLesson()} />
        <Pathname />
      </>
    ),
  });
  return loadSearchIndex;
}

async function input(): Promise<HTMLElement> {
  return screen.findByRole('combobox', { name: SEARCH_LABEL });
}

async function typeQuery(query: string): Promise<HTMLElement> {
  const box = await input();
  fireEvent.focus(box);
  fireEvent.change(box, { target: { value: query } });
  return box;
}

describe('SearchBox', () => {
  it('is a labelled combobox that owns a listbox', async () => {
    await renderSearch();
    const box = await input();

    expect(box.getAttribute('aria-autocomplete')).toBe('list');
    expect(box.getAttribute('aria-expanded')).toBe('false');
    const listbox = document.getElementById(box.getAttribute('aria-controls') ?? '');
    expect(listbox?.getAttribute('role')).toBe('listbox');
    FOCUS_RING_CLASS.split(' ').forEach((token) => expect(box.className).toContain(token));
    expect(box.getAttribute('placeholder')).toBe('Hoặc tra nhanh: sao, cung, thuật ngữ…');
  });

  it('loads the index on first focus only', async () => {
    const loader = await renderSearch();
    const box = await input();

    fireEvent.focus(box);
    fireEvent.blur(box);
    fireEvent.focus(box);

    await waitFor(() => expect(loader).toHaveBeenCalledTimes(1));
  });

  it('retries the index on the next focus after a failed load', async () => {
    const loader: SearchIndexLoaderMock = jest
      .fn<Promise<readonly KienThucSearchItem[]>, []>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockImplementation(() => FIXTURE_SOURCE.loadSearchIndex());
    await renderSearch(loader);
    const box = await input();

    fireEvent.focus(box);
    await waitFor(() => expect(loader).toHaveBeenCalledTimes(1));
    await act(async () => Promise.resolve());
    fireEvent.focus(box);
    fireEvent.change(box, { target: { value: 'thien' } });

    expect(await screen.findByRole('option', { name: /Sao Thiên Cơ/ })).toBeTruthy();
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it('lists matches with their kind', async () => {
    await renderSearch();
    const box = await typeQuery('thien');

    const option = await screen.findByRole('option', { name: /Sao Thiên Cơ/ });
    expect(box.getAttribute('aria-expanded')).toBe('true');
    expect(within(option).getByText('Sao')).toBeTruthy();
    const classNames = Array.from(document.querySelectorAll('*')).map((node) => node.className);
    FORBIDDEN_CLASS_PREFIXES.forEach((prefix) =>
      classNames.forEach((className) => expect(String(className)).not.toContain(prefix)),
    );
  });

  it('moves with the arrow keys and opens with Enter', async () => {
    await renderSearch();
    const box = await typeQuery('sao thien');
    const option = await screen.findByRole('option', { name: /Sao Thiên Cơ/ });

    fireEvent.keyDown(box, { key: 'ArrowDown' });

    expect(box.getAttribute('aria-activedescendant')).toBe(option.id);
    expect(option.getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(box, { key: 'Enter' });
    await waitFor(() =>
      expect(screen.getByTestId(PATHNAME_TEST_ID).textContent).toBe('/kien-thuc/sao/thien-co'),
    );
  });

  it('opens an option on click', async () => {
    await renderSearch();
    await typeQuery('ta phu');

    fireEvent.click(await screen.findByRole('option', { name: /Sao Tả Phù/ }));

    await waitFor(() =>
      expect(screen.getByTestId(PATHNAME_TEST_ID).textContent).toBe('/kien-thuc/sao/ta-phu'),
    );
  });

  it('closes on Escape', async () => {
    await renderSearch();
    const box = await typeQuery('thien');
    await screen.findByRole('option', { name: /Sao Thiên Cơ/ });

    fireEvent.keyDown(box, { key: 'Escape' });

    expect(box.getAttribute('aria-expanded')).toBe('false');
  });

  it('offers the first lesson when nothing matches', async () => {
    await renderSearch();
    await typeQuery('xyz');

    expect(await screen.findByText('Không tìm thấy mục nào.')).toBeTruthy();
    const link = screen.getByRole('link', { name: 'Bắt đầu với bài Tử vi là gì →' });
    expect(link.getAttribute('href')).toBe('/kien-thuc/tu-vi-la-gi');
    FOCUS_RING_CLASS.split(' ').forEach((token) => expect(link.className).toContain(token));
  });

  it('shows a loading line while the index loads', async () => {
    const loader: SearchIndexLoaderMock = jest.fn(
      () => new Promise<readonly KienThucSearchItem[]>(() => undefined),
    );
    await renderSearch(loader);
    await typeQuery('thien');

    const loadingLine = await screen.findByText('Đang tải mục lục…');
    expect(loadingLine.closest('[role="status"]')).not.toBeNull();
  });
});
