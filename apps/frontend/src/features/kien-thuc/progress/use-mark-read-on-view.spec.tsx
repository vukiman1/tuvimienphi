import { act, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import {
  stubIntersectionObserver,
  type IntersectionObserverStub,
} from '@/test-utils/stub-intersection-observer';
import { clearLocalProgress, readLocalProgress } from './local-progress-store';
import { useMarkReadOnView } from './use-mark-read-on-view';

function LessonEnd(): ReactElement {
  const ref = useMarkReadOnView('tu-vi-la-gi');
  return <div ref={ref} data-testid="end" />;
}

function renderLessonEnd(): void {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <LessonEnd />
    </QueryClientProvider>,
  );
}

let observer: IntersectionObserverStub;

beforeEach(() => {
  clearLocalProgress();
  observer = stubIntersectionObserver();
});

afterEach(() => {
  observer.restore();
});

describe('useMarkReadOnView', () => {
  it('does not mark on mount', () => {
    renderLessonEnd();

    expect(readLocalProgress().size).toBe(0);
  });

  it('marks the lesson when its end is half visible', () => {
    renderLessonEnd();
    const end = screen.getByTestId('end');

    act(() => observer.reveal(end, 0.4));
    expect(readLocalProgress().size).toBe(0);

    act(() => observer.reveal(end, 0.6));
    expect(readLocalProgress().has('tu-vi-la-gi')).toBe(true);
  });
});
