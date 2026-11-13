import { toast, type ToastOptions } from 'react-toastify/unstyled';
import { notify } from './toast';

jest.mock('react-toastify/unstyled', () => ({ toast: jest.fn() }));

const MESSAGE = 'Đã đổi mật khẩu. Các thiết bị khác đã được đăng xuất.';

const toastMock = jest.mocked(toast);

function lastToastOptions(): ToastOptions | undefined {
  const [, options] = toastMock.mock.lastCall ?? [];
  return options;
}

describe('notify', () => {
  it('keeps errors on screen twice as long as confirmations', () => {
    notify.error(MESSAGE);
    expect(lastToastOptions()?.autoClose).toBe(8000);

    notify.success(MESSAGE);
    expect(lastToastOptions()?.autoClose).toBe(4000);

    notify.info(MESSAGE);
    expect(lastToastOptions()?.autoClose).toBe(4000);
  });
});
