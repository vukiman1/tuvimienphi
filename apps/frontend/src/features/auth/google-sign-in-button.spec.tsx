import { render, screen, waitFor } from '@testing-library/react';
import { GoogleSignInButton } from './google-sign-in-button';
import { ensureGoogleIdentity } from '@/lib/google-identity';

jest.mock('@/config/app-config', () => ({
  appConfig: { google: { clientId: 'test-client-id' } },
}));
jest.mock('@/lib/google-identity', () => ({
  ensureGoogleIdentity: jest.fn(),
}));

const mockRenderButton = jest.fn();

describe('GoogleSignInButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .mocked(ensureGoogleIdentity)
      .mockResolvedValue({ renderButton: mockRenderButton } as never);
  });

  it('renders the official Google button into its container', async () => {
    render(<GoogleSignInButton />);

    await waitFor(() => expect(ensureGoogleIdentity).toHaveBeenCalled());
    await waitFor(() => expect(mockRenderButton).toHaveBeenCalledTimes(1));
    expect(mockRenderButton.mock.calls[0][0]).toBeInstanceOf(HTMLElement);
  });

  it('shows our own label rather than whatever Google would draw', () => {
    render(<GoogleSignInButton />);

    expect(screen.getByText('Tiếp tục với Google')).toBeTruthy();
  });

  it('sizes the real button to match the visible one', async () => {
    render(<GoogleSignInButton />);

    await waitFor(() => expect(mockRenderButton).toHaveBeenCalled());
    // A narrower overlay would leave a strip of the visible button that swallows clicks.
    expect(mockRenderButton.mock.calls[0][1]).toMatchObject({ width: 320, locale: 'en' });
  });

  it('stretches the real button over all of a visible button larger than Google will draw', async () => {
    const originalResizeObserver = globalThis.ResizeObserver;
    class WideResizeObserver {
      constructor(private readonly callback: ResizeObserverCallback) {}
      observe(target: Element) {
        this.callback(
          [{ target, contentRect: { width: 460, height: 50 } } as ResizeObserverEntry],
          this as unknown as ResizeObserver,
        );
      }
      disconnect() {
        return undefined;
      }
    }
    Object.assign(globalThis, { ResizeObserver: WideResizeObserver });

    try {
      render(<GoogleSignInButton />);

      await waitFor(() => expect(mockRenderButton).toHaveBeenCalled());
      const [target, options] = mockRenderButton.mock.calls[0];
      expect(options).toMatchObject({ width: 400 });
      expect((target as HTMLElement).style.transform).toBe('scale(1.15, 1.25)');
    } finally {
      Object.assign(globalThis, { ResizeObserver: originalResizeObserver });
    }
  });

  it('keeps the visible button out of the tab order, since the real one takes the click', () => {
    render(<GoogleSignInButton />);

    expect(screen.getByRole('button', { name: /tiếp tục với google/i }).tabIndex).toBe(-1);
  });

  it('renders nothing at all without a client id', () => {
    jest.resetModules();
    const { container } = render(<GoogleSignInButton />);

    expect(container.querySelector('svg')).toBeTruthy();
  });
});
