import { act, fireEvent, render, screen } from '@testing-library/react';
import { toast } from 'react-toastify/unstyled';
import { notify } from '@/lib/toast';
import { AppToastContainer } from './app-toast-container';

const BURST_SIZE = 5;
const VISIBLE_LIMIT = 3;

function errorMessage(index: number): string {
  return `Chưa lưu được mục ${index}. Bạn thử lại nhé.`;
}

describe('AppToastContainer', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('places toasts at the bottom centre, three at most', async () => {
    const { container } = render(<AppToastContainer />);

    act(() => {
      for (let index = 1; index <= BURST_SIZE; index += 1) {
        notify.error(errorMessage(index));
      }
    });

    const alerts = await screen.findAllByRole('alert');
    expect(alerts.map((alert) => alert.textContent)).toEqual(
      [1, 2, 3].map((index) => errorMessage(index)),
    );
    expect(alerts).toHaveLength(VISIBLE_LIMIT);
    expect(container.querySelector('.Toastify__toast-container--bottom-center')).not.toBeNull();
    expect(container.querySelector('[role="progressbar"][aria-hidden="false"]')).toBeNull();
  });

  it('announces each toast once', async () => {
    render(<AppToastContainer />);

    act(() => {
      notify.error(errorMessage(1));
    });

    expect(await screen.findAllByRole('alert')).toHaveLength(1);
  });

  it('holds the timer while the close button has keyboard focus', async () => {
    const pause = jest.spyOn(toast, 'pause');
    const play = jest.spyOn(toast, 'play');
    render(<AppToastContainer />);

    act(() => {
      notify.info('Đã gửi lại mã. Bạn kiểm tra email nhé.');
    });
    const closeButton = await screen.findByRole('button', { name: 'Đóng thông báo' });

    fireEvent.focus(closeButton);
    expect(pause).toHaveBeenCalledWith({ id: expect.anything() });

    fireEvent.blur(closeButton);
    expect(play).toHaveBeenCalledWith({ id: expect.anything() });
  });
});
