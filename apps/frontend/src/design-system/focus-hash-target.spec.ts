import { focusHashTarget } from './focus-hash-target';

const FRAME_MS = 16;
const LONGER_THAN_ANY_PAGE_LOAD_MS = 10_000;

function mountTarget(id: string): HTMLElement {
  const target = document.createElement('section');
  target.id = id;
  target.tabIndex = -1;
  document.body.append(target);
  return target;
}

describe('focusHashTarget', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    document.body.replaceChildren();
  });

  it('focuses a target that is already on the page', () => {
    const target = mountTarget('lap-la-so');

    focusHashTarget('lap-la-so');
    jest.advanceTimersByTime(FRAME_MS);

    expect(document.activeElement).toBe(target);
  });

  it('focuses a target that only mounts once the next page has loaded', () => {
    focusHashTarget('lap-la-so');
    jest.advanceTimersByTime(FRAME_MS * 10);
    const target = mountTarget('lap-la-so');
    jest.advanceTimersByTime(FRAME_MS);

    expect(document.activeElement).toBe(target);
  });

  it('stops waiting for a target that never arrives', () => {
    focusHashTarget('lap-la-so');
    jest.advanceTimersByTime(LONGER_THAN_ANY_PAGE_LOAD_MS);
    const target = mountTarget('lap-la-so');
    jest.advanceTimersByTime(FRAME_MS * 10);

    expect(document.activeElement).not.toBe(target);
  });
});
