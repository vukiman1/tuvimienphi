import { act, renderHook } from '@testing-library/react';
import { chapterIndexAt } from './active-chapter';
import { sectionProgress } from './scroll-progress';
import { useSectionProgress } from './use-section-progress';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const ORIGINAL_MATCH_MEDIA = window.matchMedia;
const VIEWPORT_HEIGHT = window.innerHeight;

function stubMatchMedia(matchingQuery: string): void {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: query === matchingQuery,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

function rectAt(top: number, height: number): DOMRect {
  return {
    top,
    bottom: top + height,
    left: 0,
    right: 100,
    width: 100,
    height,
    x: 0,
    y: top,
    toJSON: () => ({}),
  };
}

describe('sectionProgress', () => {
  it.each([
    [0, 2000, 1000, 0],
    [-500, 2000, 1000, 0.5],
    [-3000, 2000, 1000, 1],
    [200, 2000, 1000, 0],
    [0, 800, 1000, 1],
  ])('top %p, height %p, viewport %p gives %p', (top, height, viewport, expected) => {
    expect(sectionProgress(top, height, viewport)).toBe(expected);
  });
});

describe('chapterIndexAt', () => {
  const CHAPTERS = [
    { top: -900, bottom: -100 },
    { top: -100, bottom: 700 },
    { top: 700, bottom: 1500 },
  ];

  it('picks the chapter that contains the probe line', () => {
    expect(chapterIndexAt(CHAPTERS, 384)).toBe(1);
  });

  it('gives a shared edge to the lower chapter', () => {
    expect(chapterIndexAt(CHAPTERS, 700)).toBe(2);
  });

  it('finds no chapter above the first one', () => {
    expect(chapterIndexAt(CHAPTERS, -950)).toBeNull();
  });

  it('finds no chapter below the last one, such as over the footer', () => {
    expect(chapterIndexAt(CHAPTERS, 1600)).toBeNull();
  });
});

describe('useSectionProgress', () => {
  afterEach(() => {
    window.matchMedia = ORIGINAL_MATCH_MEDIA;
  });

  it('reports the final state when the reader prefers reduced motion', () => {
    stubMatchMedia(REDUCED_MOTION_QUERY);
    const element = document.createElement('div');
    jest
      .spyOn(element, 'getBoundingClientRect')
      .mockReturnValue(rectAt(-500, 1000 + VIEWPORT_HEIGHT));

    const { result } = renderHook(() => useSectionProgress({ current: element }));
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toEqual({ progress: 1, isLive: false });
  });

  it('reports a still, complete state until the reader scrolls, so prerendered markup is complete', () => {
    const element = document.createElement('div');
    jest
      .spyOn(element, 'getBoundingClientRect')
      .mockReturnValue(rectAt(800, 1000 + VIEWPORT_HEIGHT));

    const { result } = renderHook(() => useSectionProgress({ current: element }));

    expect(result.current).toEqual({ progress: 1, isLive: false });
  });

  it('follows the scroll position once the reader scrolls', async () => {
    const element = document.createElement('div');
    jest
      .spyOn(element, 'getBoundingClientRect')
      .mockReturnValue(rectAt(-500, 1000 + VIEWPORT_HEIGHT));

    const { result } = renderHook(() => useSectionProgress({ current: element }));
    await act(async () => {
      window.dispatchEvent(new Event('scroll'));
      await new Promise((resolve) => window.requestAnimationFrame(resolve));
    });

    expect(result.current).toEqual({ progress: 0.5, isLive: true });
  });
});
