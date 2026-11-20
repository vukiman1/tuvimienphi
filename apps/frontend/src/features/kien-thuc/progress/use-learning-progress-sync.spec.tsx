import type { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, waitFor } from '@testing-library/react';
import { endSession } from '@/features/auth/session';
import { useAuthStore } from '@/stores/auth-store';
import { LEARNING_PROGRESS_QUERY_KEY } from './learning-progress-query';
import { clearLocalProgress, markLessonRead, readLocalProgress } from './local-progress-store';
import { mergeDeviceProgress } from './merge-device-progress';
import { useLearningProgressSync } from './use-learning-progress-sync';

jest.mock('./merge-device-progress', () => ({ mergeDeviceProgress: jest.fn() }));

const merge = jest.mocked(mergeDeviceProgress);
const SIGNED_IN = { user: { email: 'reader@example.com' }, isInitializing: false };

function Probe(): null {
  useLearningProgressSync();
  return null;
}

function renderSync(queryClient: QueryClient): { rerender: () => void } {
  const tree = (): ReactElement => (
    <QueryClientProvider client={queryClient}>
      <Probe />
    </QueryClientProvider>
  );
  const view = render(tree());
  return { rerender: () => view.rerender(tree()) };
}

beforeEach(() => {
  window.localStorage.clear();
  clearLocalProgress();
  useAuthStore.setState({ user: null, isInitializing: true });
  merge.mockReset().mockResolvedValue(new Set());
});

describe('useLearningProgressSync', () => {
  it('waits for auth to settle before merging', () => {
    useAuthStore.setState({ user: { email: 'reader@example.com' }, isInitializing: true });

    renderSync(new QueryClient());

    expect(merge).not.toHaveBeenCalled();
  });

  it('merges once when a reader signs in', () => {
    const { rerender } = renderSync(new QueryClient());

    act(() => useAuthStore.setState(SIGNED_IN));
    expect(merge).toHaveBeenCalledTimes(1);

    rerender();
    expect(merge).toHaveBeenCalledTimes(1);
  });

  it('merges again after signing out and back in', () => {
    renderSync(new QueryClient());

    act(() => useAuthStore.setState(SIGNED_IN));
    act(() => useAuthStore.setState({ user: null, isInitializing: false }));
    act(() => useAuthStore.setState(SIGNED_IN));

    expect(merge).toHaveBeenCalledTimes(2);
  });

  it('seeds the progress query with the merged lessons', async () => {
    const slugs = new Set(['tu-vi-la-gi']);
    merge.mockResolvedValue(slugs);
    const queryClient = new QueryClient();
    renderSync(queryClient);

    act(() => useAuthStore.setState(SIGNED_IN));

    await waitFor(() => expect(queryClient.getQueryData(LEARNING_PROGRESS_QUERY_KEY)).toBe(slugs));
  });

  it('clears the device when the reader signs out', () => {
    markLessonRead('tu-vi-la-gi');
    renderSync(new QueryClient());

    act(() => useAuthStore.setState(SIGNED_IN));
    act(() => useAuthStore.setState({ user: null, isInitializing: false }));

    expect(readLocalProgress().size).toBe(0);
  });

  it('clears the device when the session ends without a sign-out', () => {
    markLessonRead('tu-vi-la-gi');
    renderSync(new QueryClient());

    act(() => useAuthStore.setState(SIGNED_IN));
    act(() => endSession());

    expect(readLocalProgress().size).toBe(0);
  });

  it("leaves an anonymous visitor's progress alone on load", () => {
    markLessonRead('tu-vi-la-gi');
    renderSync(new QueryClient());

    act(() => useAuthStore.setState({ user: null, isInitializing: false }));

    expect(readLocalProgress().has('tu-vi-la-gi')).toBe(true);
    expect(merge).not.toHaveBeenCalled();
  });

  it('keeps the device copy and logs when the merge fails', async () => {
    const failure = new Error('boom');
    merge.mockRejectedValue(failure);
    const logged = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    markLessonRead('tu-vi-la-gi');
    renderSync(new QueryClient());

    act(() => useAuthStore.setState(SIGNED_IN));

    await waitFor(() =>
      expect(logged).toHaveBeenCalledWith(
        'Không đồng bộ được tiến độ học sau khi đăng nhập',
        failure,
      ),
    );
    expect(readLocalProgress().has('tu-vi-la-gi')).toBe(true);
    logged.mockRestore();
  });
});
