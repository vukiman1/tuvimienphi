import { fireEvent, render, waitFor } from '@testing-library/react';
import { GoogleSignInButton } from './google-sign-in-button';
import { ensureGoogleIdentity } from '@/lib/google-identity';

const mockGoogleConfig = { clientId: 'test-client-id' };

jest.mock('@/config/app-config', () => ({
  appConfig: {
    get google() {
      return mockGoogleConfig;
    },
  },
}));
jest.mock('@/lib/google-identity', () => ({
  ensureGoogleIdentity: jest.fn(),
}));

const HIDING_CLASSES = ['opacity-0', 'invisible', 'sr-only', 'hidden'] as const;
const COVERING_CLASSES = ['absolute', 'fixed', 'sticky'] as const;
const WIDE_SLOT_WIDTH = 460;

const mockRenderButton = jest.fn();

async function renderGoogleTarget(): Promise<{ container: HTMLElement; target: HTMLElement }> {
  const { container } = render(<GoogleSignInButton />);
  await waitFor(() => expect(mockRenderButton).toHaveBeenCalled());
  const [target] = mockRenderButton.mock.calls[0] as [HTMLElement];
  return { container, target };
}

function ancestorsWithin(element: HTMLElement, root: HTMLElement): readonly HTMLElement[] {
  const ancestors: HTMLElement[] = [];
  for (let node: HTMLElement | null = element; node && node !== root; node = node.parentElement) {
    ancestors.push(node);
  }
  return ancestors;
}

function withSlotWidth(width: number): () => void {
  const originalResizeObserver = globalThis.ResizeObserver;
  class FixedWidthResizeObserver {
    constructor(private readonly callback: ResizeObserverCallback) {}
    observe(target: Element): void {
      this.callback(
        [{ target, contentRect: { width, height: 40 } } as ResizeObserverEntry],
        this as unknown as ResizeObserver,
      );
    }
    disconnect(): void {
      return undefined;
    }
  }
  Object.assign(globalThis, { ResizeObserver: FixedWidthResizeObserver });
  return () => Object.assign(globalThis, { ResizeObserver: originalResizeObserver });
}

describe('GoogleSignInButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGoogleConfig.clientId = 'test-client-id';
    jest
      .mocked(ensureGoogleIdentity)
      .mockResolvedValue({ renderButton: mockRenderButton } as never);
  });

  it('renders the official Google button at the measured width of the modal content', async () => {
    const { target } = await renderGoogleTarget();

    expect(target).toBeInstanceOf(HTMLElement);
    expect(mockRenderButton.mock.calls[0][1]).toMatchObject({
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      locale: 'vi',
      width: 320,
    });
  });

  it('asks for no more than the 400 px Google will draw when the content is wider', async () => {
    const restoreResizeObserver = withSlotWidth(WIDE_SLOT_WIDTH);

    try {
      await renderGoogleTarget();

      expect(mockRenderButton.mock.calls[0][1]).toMatchObject({ width: 400 });
    } finally {
      restoreResizeObserver();
    }
  });

  it('never hides the Google button, since Chrome ignores clicks on a button it cannot see', async () => {
    const { container, target } = await renderGoogleTarget();

    for (const element of ancestorsWithin(target, container)) {
      for (const hidingClass of HIDING_CLASSES) {
        expect(element.classList.contains(hidingClass)).toBe(false);
      }
      expect(element.style.opacity).toBe('');
      expect(element.style.visibility).toBe('');
      expect(element.style.transform).toBe('');
    }
  });

  it('draws nothing over the Google button', async () => {
    const { container, target } = await renderGoogleTarget();
    const ancestors = ancestorsWithin(target, container);

    for (const element of container.querySelectorAll<HTMLElement>('*')) {
      if (ancestors.includes(element) || target.contains(element)) {
        continue;
      }
      expect(target.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(0);
      for (const coveringClass of COVERING_CLASSES) {
        expect(element.classList.contains(coveringClass)).toBe(false);
      }
      expect([...element.classList].some((className) => className.startsWith('z-'))).toBe(false);
    }
  });

  it('reserves the button height with a placeholder until Google has loaded it', async () => {
    const googleFrame = document.createElement('div');
    mockRenderButton.mockImplementation((parent: HTMLElement) => parent.appendChild(googleFrame));
    const { container, target } = await renderGoogleTarget();
    const placeholder = container.querySelector<HTMLElement>('[aria-hidden="true"]');

    expect(placeholder?.classList.contains('h-10')).toBe(true);
    expect(target.parentElement?.classList.contains('h-10')).toBe(true);
    expect(container.querySelector('button')).toBeNull();

    fireEvent.load(googleFrame);

    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it('renders nothing without a client id', () => {
    mockGoogleConfig.clientId = '';

    const { container } = render(<GoogleSignInButton />);

    expect(container.childElementCount).toBe(0);
    expect(ensureGoogleIdentity).not.toHaveBeenCalled();
  });
});
