import { fireEvent, render, screen } from '@testing-library/react';
import { FOCUS_RING_CLASS } from '@/design-system';
import { ToastCard, ToastVariant } from './toast-card';

const MESSAGE = 'Đã cập nhật ảnh đại diện.';
const TITLE = 'Chưa tải ảnh lên được';
const TITLE_SELECTOR = '.font-semibold';

describe('ToastCard', () => {
  it('announces errors as alerts and everything else as status', () => {
    const { unmount } = render(<ToastCard message={MESSAGE} variant={ToastVariant.Error} />);
    expect(screen.getByRole('alert').textContent).toContain(MESSAGE);
    expect(screen.queryByRole('status')).toBeNull();
    unmount();

    for (const variant of [ToastVariant.Success, ToastVariant.Info]) {
      const { unmount: unmountQuiet } = render(<ToastCard message={MESSAGE} variant={variant} />);
      expect(screen.getByRole('status').textContent).toContain(MESSAGE);
      expect(screen.queryByRole('alert')).toBeNull();
      unmountQuiet();
    }
  });

  it('shows only the message when no title is given', () => {
    const { container } = render(<ToastCard message={MESSAGE} variant={ToastVariant.Success} />);

    expect(screen.queryByRole('heading')).toBeNull();
    expect(container.querySelector(TITLE_SELECTOR)).toBeNull();
    expect(screen.getByRole('status').textContent).toBe(MESSAGE);
  });

  it("shows the caller's title above the message", () => {
    const { container } = render(
      <ToastCard message={MESSAGE} title={TITLE} variant={ToastVariant.Error} />,
    );

    const title = container.querySelector(TITLE_SELECTOR);
    const message = screen.getByText(MESSAGE);
    expect(title?.textContent).toBe(TITLE);
    expect(
      title !== null &&
        Boolean(title.compareDocumentPosition(message) & Node.DOCUMENT_POSITION_FOLLOWING),
    ).toBe(true);
  });

  it('draws no images', () => {
    const { container } = render(<ToastCard message={MESSAGE} variant={ToastVariant.Info} />);

    expect(container.querySelector('img')).toBeNull();
  });

  it('closes from a labelled button', () => {
    const onClose = jest.fn();
    render(<ToastCard message={MESSAGE} onClose={onClose} variant={ToastVariant.Success} />);

    const closeButton = screen.getByRole('button', { name: 'Đóng thông báo' });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
    for (const focusClass of FOCUS_RING_CLASS.split(' ')) {
      expect(closeButton.classList.contains(focusClass)).toBe(true);
    }
  });
});
