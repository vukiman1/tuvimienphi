import { startApp } from './start-app';

interface Gate {
  readonly promise: Promise<void>;
  readonly open: () => void;
}

function createGate(): Gate {
  let open: () => void = () => undefined;
  const promise = new Promise<void>((resolve) => {
    open = resolve;
  });
  return { promise, open };
}

describe('startApp', () => {
  it('waits for the prerendered page to paint before loading the app', async () => {
    const firstPaint = createGate();
    const loadApp = jest.fn(() => Promise.resolve());

    const started = startApp({
      isPrerendered: () => true,
      whenFirstPainted: () => firstPaint.promise,
      loadApp,
    });
    await Promise.resolve();
    expect(loadApp).not.toHaveBeenCalled();

    firstPaint.open();
    await started;
    expect(loadApp).toHaveBeenCalledTimes(1);
  });

  it('loads the app straight away on the SPA shell', async () => {
    const whenFirstPainted = jest.fn(() => new Promise<void>(() => undefined));
    const loadApp = jest.fn(() => Promise.resolve());

    await startApp({ isPrerendered: () => false, whenFirstPainted, loadApp });

    expect(loadApp).toHaveBeenCalledTimes(1);
    expect(whenFirstPainted).not.toHaveBeenCalled();
  });
});
