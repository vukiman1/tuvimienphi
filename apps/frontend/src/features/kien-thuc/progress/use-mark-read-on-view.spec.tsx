import { act, render, screen } from '@testing-library/react';
import {
  stubIntersectionObserver,
  type IntersectionObserverStub,
} from '@/test-utils/stub-intersection-observer';
import { clearLocalProgress, readLocalProgress } from './local-progress-store';
import { useMarkReadOnView } from './use-mark-read-on-view';

function LessonEnd() {
  const ref = useMarkReadOnView('tu-vi-la-gi');
  return <div ref={ref} data-testid="end" />;
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
    render(<LessonEnd />);

    expect(readLocalProgress().size).toBe(0);
  });

  it('marks the lesson when its end is half visible', () => {
    render(<LessonEnd />);
    const end = screen.getByTestId('end');

    act(() => observer.reveal(end, 0.4));
    expect(readLocalProgress().size).toBe(0);

    act(() => observer.reveal(end, 0.6));
    expect(readLocalProgress().has('tu-vi-la-gi')).toBe(true);
  });
});
