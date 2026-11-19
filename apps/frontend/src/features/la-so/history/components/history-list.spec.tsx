import { renderToString } from 'react-dom/server';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { CalendarType, Gender, type BirthInput } from '@org/shared-contracts';
import { FOCUS_RING_CLASS } from '@/design-system';
import { recordLocalHistory } from '../local-history-store';
import { laSoHistoryQueryKey } from '../use-la-so-history';
import { HistoryList } from './history-list';

const ENTRY: BirthInput = {
  fullName: 'Nguyễn Văn A',
  day: 12,
  month: 3,
  year: 1995,
  calendar: CalendarType.Solar,
  hour: 'Ngọ',
  gender: Gender.Male,
};

/** The cards are links, so the list only renders inside a router. */
function renderList() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const rootRoute = createRootRoute({ component: HistoryList });
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router as never} />
    </QueryClientProvider>,
  );
}

function classTokens(element: Element | null): readonly string[] {
  return element?.getAttribute('class')?.split(/\s+/) ?? [];
}

beforeEach(() => {
  window.localStorage.clear();
});

describe('HistoryList', () => {
  it('leaves the history out of the prerendered page, since it lives in the browser', () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(laSoHistoryQueryKey(false), []);

    const markup = renderToString(
      <QueryClientProvider client={queryClient}>
        <HistoryList />
      </QueryClientProvider>,
    );

    expect(markup).toBe('');
  });

  it('tells a visitor with no charts where to make one', async () => {
    renderList();

    expect(await screen.findByText(/Chưa có lá số nào/)).toBeTruthy();
  });

  it('shows a card for each chart already viewed', async () => {
    recordLocalHistory(ENTRY);

    renderList();

    await waitFor(() => expect(screen.getByText('Nguyễn Văn A')).toBeTruthy());
    expect(screen.queryByText(/Chưa có lá số nào/)).toBeNull();
  });

  it('shows each chart as a Day tile with the focus ring', async () => {
    recordLocalHistory(ENTRY);

    renderList();

    const card = (await screen.findByText('Nguyễn Văn A')).closest('a');
    expect(classTokens(card)).toEqual(
      expect.arrayContaining(['bg-day', 'border-ink/15', ...FOCUS_RING_CLASS.split(' ')]),
    );
  });

  it('gives the remove button a 44 px target', async () => {
    recordLocalHistory(ENTRY);

    renderList();

    const remove = await screen.findByRole('button', {
      name: 'Xoá lá số Nguyễn Văn A khỏi lịch sử',
    });
    expect(classTokens(remove)).toEqual(
      expect.arrayContaining(['size-11', ...FOCUS_RING_CLASS.split(' ')]),
    );
  });

  it('shows no icon image on a card', async () => {
    recordLocalHistory(ENTRY);

    const { container } = renderList();

    await screen.findByText('Nguyễn Văn A');
    expect(container.querySelectorAll('ul img')).toHaveLength(0);
  });
});
