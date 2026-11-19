import { act, render, screen } from '@testing-library/react';
import { clearLocalProgress, markLessonRead } from './local-progress-store';
import { useLessonProgress } from './use-lesson-progress';

function Probe() {
  const { readSlugs } = useLessonProgress();
  return <p data-testid="count">{readSlugs.size}</p>;
}

beforeEach(() => {
  clearLocalProgress();
});

describe('useLessonProgress', () => {
  it('re-renders with a lesson marked elsewhere', () => {
    render(<Probe />);
    expect(screen.getByTestId('count').textContent).toBe('0');

    act(() => markLessonRead('can'));

    expect(screen.getByTestId('count').textContent).toBe('1');
  });
});
