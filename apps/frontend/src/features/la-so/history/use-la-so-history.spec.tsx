import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { CalendarType, Gender, type BirthInput } from '@org/shared-contracts';
import { recordLocalHistory } from './local-history-store';
import { useLaSoHistory } from './use-la-so-history';

const FIRST: BirthInput = {
  day: 1,
  month: 1,
  year: 1990,
  calendar: CalendarType.Lunar,
  hour: 'Tý',
  gender: Gender.Female,
};

const SECOND: BirthInput = {
  day: 12,
  month: 3,
  year: 1995,
  calendar: CalendarType.Solar,
  hour: 'Ngọ',
  gender: Gender.Male,
};

function renderHistory() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const view = renderHook(() => useLaSoHistory(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
  return { ...view, queryClient };
}

beforeEach(() => {
  window.localStorage.clear();
});

describe('useLaSoHistory for a signed-out visitor', () => {
  it('lists what the browser holds, newest first', async () => {
    recordLocalHistory(SECOND, new Date('2026-01-01T00:00:00.000Z'));
    recordLocalHistory(FIRST, new Date('2026-02-01T00:00:00.000Z'));

    const { result } = renderHistory();

    await waitFor(() => expect(result.current.entries).toHaveLength(2));
    expect(result.current.entries[0].year).toBe(1990);
  });

  it('removes only the chart asked for', async () => {
    recordLocalHistory(SECOND, new Date('2026-01-01T00:00:00.000Z'));
    recordLocalHistory(FIRST, new Date('2026-02-01T00:00:00.000Z'));

    const { result } = renderHistory();
    await waitFor(() => expect(result.current.entries).toHaveLength(2));

    act(() => result.current.remove('1990-01-01-am-h0-nu'));

    await waitFor(() => expect(result.current.entries).toHaveLength(1));
    expect(result.current.entries[0].year).toBe(1995);
  });

  /**
   * Signing out clears the whole query cache, and an anonymous visit does exactly that on every
   * page load: /auth/me answers 401, the refresh behind it answers 401, and the session ends. A
   * delete that treated the cache as the source of truth wiped the list instead of one entry.
   */
  it('keeps the surviving charts when the cache was cleared underneath it', async () => {
    recordLocalHistory(SECOND, new Date('2026-01-01T00:00:00.000Z'));
    recordLocalHistory(FIRST, new Date('2026-02-01T00:00:00.000Z'));

    const { result, queryClient } = renderHistory();
    await waitFor(() => expect(result.current.entries).toHaveLength(2));

    act(() => queryClient.clear());
    act(() => result.current.remove('1990-01-01-am-h0-nu'));

    await waitFor(() => expect(result.current.entries).toHaveLength(1));
    expect(result.current.entries[0].year).toBe(1995);
  });
});
