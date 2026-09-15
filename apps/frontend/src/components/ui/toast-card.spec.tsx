import { fireEvent, render, screen } from '@testing-library/react';
import { ToastCard } from './toast-card';

function countdownOf(container: HTMLElement): HTMLElement | null {
  return container.querySelector('[data-countdown]');
}

describe('ToastCard', () => {
  it('closes when the close button is pressed', () => {
    const onClose = jest.fn();
    render(<ToastCard message="Đã lưu." onClose={onClose} variant="success" />);

    fireEvent.click(screen.getByRole('button', { name: 'Đóng thông báo' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('counts down over exactly the time before it closes itself', () => {
    const { container } = render(
      <ToastCard autoCloseMs={8000} message="Không thể lưu." variant="error" />,
    );

    expect(countdownOf(container)?.style.animationDuration).toBe('8000ms');
    expect(countdownOf(container)?.style.animationPlayState).toBe('running');
  });

  it('freezes the countdown while the toast is paused', () => {
    const { container } = render(
      <ToastCard autoCloseMs={4000} isPaused message="Đã lưu." variant="success" />,
    );

    expect(countdownOf(container)?.style.animationPlayState).toBe('paused');
  });

  it('shows no countdown for a toast that stays until dismissed', () => {
    const { container } = render(<ToastCard message="Đã lưu." variant="info" />);

    expect(countdownOf(container)).toBeNull();
  });
});
