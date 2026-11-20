import { fireEvent, render, screen } from '@testing-library/react';
import { FOCUS_RING_CLASS } from '@/design-system';
import { ProgressCard } from './progress-card';

const FADED_TEXT_CLASS = /^text-[\w-]+\/\d+$/;
const OPACITY_CLASS = /^opacity-/;

function renderCard(): { onSignIn: jest.Mock; onSnooze: jest.Mock; container: HTMLElement } {
  const onSignIn = jest.fn();
  const onSnooze = jest.fn();
  const { container } = render(
    <ProgressCard readCount={4} totalCount={18} onSignIn={onSignIn} onSnooze={onSnooze} />,
  );
  return { onSignIn, onSnooze, container };
}

describe('ProgressCard', () => {
  it('says exactly what signing in does', () => {
    const { container } = renderCard();

    expect(screen.getByText('Bạn đã đọc 4/18 bài.')).toBeTruthy();
    expect(
      screen.getByText('Đăng nhập để giữ tiến độ và học tiếp trên mọi thiết bị.'),
    ).toBeTruthy();
    expect(container.querySelectorAll('p')).toHaveLength(2);
  });

  it('is a complementary region named by its first line', () => {
    renderCard();

    expect(screen.getByRole('complementary', { name: 'Bạn đã đọc 4/18 bài.' })).toBeTruthy();
  });

  it('offers Đăng nhập and Để sau as buttons with reachable targets', () => {
    renderCard();

    expect(screen.getByRole('button', { name: 'Đăng nhập' })).toBeTruthy();
    const snooze = screen.getByRole('button', { name: 'Để sau' });
    expect(snooze.className).toContain('min-h-11');
    FOCUS_RING_CLASS.split(' ').forEach((token) => expect(snooze.className).toContain(token));
  });

  it('calls back on each button', () => {
    const { onSignIn, onSnooze } = renderCard();

    fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));
    fireEvent.click(screen.getByRole('button', { name: 'Để sau' }));

    expect(onSignIn).toHaveBeenCalledTimes(1);
    expect(onSnooze).toHaveBeenCalledTimes(1);
  });

  it('fades no text', () => {
    const { container } = renderCard();

    const tokens = [...container.querySelectorAll('*')].flatMap((element) =>
      [...element.classList].map(String),
    );

    expect(tokens.filter((token) => FADED_TEXT_CLASS.test(token))).toEqual([]);
    expect(tokens.filter((token) => OPACITY_CLASS.test(token))).toEqual([]);
  });
});
