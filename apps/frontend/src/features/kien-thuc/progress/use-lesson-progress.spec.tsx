import type { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { learningProgressService } from '@/services/learning-progress-service';
import { useAuthStore } from '@/stores/auth-store';
import { clearLocalProgress, markLessonRead, readLocalProgress } from './local-progress-store';
import { useLessonProgress } from './use-lesson-progress';

jest.mock('@/services/learning-progress-service', () => ({
  learningProgressService: { list: jest.fn(), save: jest.fn() },
}));

const service = jest.mocked(learningProgressService);

function Probe({ markSlug }: { readonly markSlug: string }): ReactElement {
  const { readSlugs, markRead } = useLessonProgress();
  return (
    <>
      <p data-testid="slugs">{[...readSlugs].sort().join(',')}</p>
      <button type="button" data-testid="mark" onClick={() => markRead(markSlug)}>
        mark
      </button>
    </>
  );
}

function renderProbe(markSlug = 'tu-vi-la-gi'): void {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <Probe markSlug={markSlug} />
    </QueryClientProvider>,
  );
}

function slugsText(): string {
  return screen.getByTestId('slugs').textContent ?? '';
}

function clickMark(): void {
  fireEvent.click(screen.getByTestId('mark'));
}

function signIn(): void {
  useAuthStore.setState({ user: { email: 'reader@example.com' }, isInitializing: false });
}

beforeEach(() => {
  window.localStorage.clear();
  clearLocalProgress();
  useAuthStore.setState({ user: null, isInitializing: false });
  service.list.mockReset().mockResolvedValue({ slugs: [] });
  service.save.mockReset().mockResolvedValue(undefined);
});

describe('useLessonProgress', () => {
  it('re-renders with a lesson marked elsewhere', () => {
    renderProbe();
    expect(slugsText()).toBe('');

    act(() => markLessonRead('can'));

    expect(slugsText()).toBe('can');
  });

  it('reads only the device while signed out, without calling the API', () => {
    markLessonRead('tu-vi-la-gi');

    renderProbe();

    expect(slugsText()).toBe('tu-vi-la-gi');
    expect(service.list).not.toHaveBeenCalled();
  });

  it('does not call the API while auth is still initializing', () => {
    useAuthStore.setState({ user: null, isInitializing: true });

    renderProbe();

    expect(service.list).not.toHaveBeenCalled();
  });

  it("reads the account's lessons when signed in", async () => {
    service.list.mockResolvedValue({ slugs: ['tu-vi-la-gi'] });
    signIn();

    renderProbe();

    await waitFor(() => expect(slugsText()).toBe('tu-vi-la-gi'));
  });

  it('adds device lessons not yet merged while signed in', async () => {
    markLessonRead('12-cung-tu-vi');
    service.list.mockResolvedValue({ slugs: ['tu-vi-la-gi'] });
    signIn();

    renderProbe();

    await waitFor(() => expect(slugsText()).toBe('12-cung-tu-vi,tu-vi-la-gi'));
  });

  it('saves a read to the account when signed in', async () => {
    service.list.mockResolvedValue({ slugs: ['tu-vi-la-gi'] });
    signIn();
    renderProbe('cung-menh-va-cung-than');
    await waitFor(() => expect(slugsText()).toContain('tu-vi-la-gi'));

    clickMark();

    await waitFor(() => expect(service.save).toHaveBeenCalledWith(['cung-menh-va-cung-than']));
    await waitFor(() => expect(slugsText()).toContain('cung-menh-va-cung-than'));
  });

  it('does not resend a lesson the account already holds', async () => {
    service.list.mockResolvedValue({ slugs: ['tu-vi-la-gi'] });
    signIn();
    renderProbe('tu-vi-la-gi');
    await waitFor(() => expect(slugsText()).toContain('tu-vi-la-gi'));

    clickMark();

    expect(service.save).not.toHaveBeenCalled();
  });

  it('keeps a read on the device when the account save fails', async () => {
    const failure = new Error('boom');
    service.save.mockRejectedValue(failure);
    const logged = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    signIn();
    renderProbe('cung-menh-va-cung-than');
    await waitFor(() => expect(service.list).toHaveBeenCalled());

    clickMark();

    await waitFor(() => expect(readLocalProgress().has('cung-menh-va-cung-than')).toBe(true));
    expect(logged).toHaveBeenCalled();
    logged.mockRestore();
  });
});
