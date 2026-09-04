import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { CalendarType, Gender, type BirthInput } from '@org/shared-contracts';
import { recordLocalHistory } from '../local-history-store';
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

beforeEach(() => {
  window.localStorage.clear();
});

describe('HistoryList', () => {
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
});
