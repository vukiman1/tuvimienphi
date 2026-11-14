import { act, renderHook } from '@testing-library/react';
import { useMediaQuery } from './use-media-query';

const QUERY = '(min-width: 80rem)';
const ORIGINAL_MATCH_MEDIA = window.matchMedia;

interface MediaQueryStub {
  readonly setMatches: (matches: boolean) => void;
}

class StubMediaQueryList extends EventTarget implements MediaQueryList {
  readonly onchange = null;

  constructor(
    readonly media: string,
    public matches: boolean,
  ) {
    super();
  }

  addListener(): void {
    return undefined;
  }

  removeListener(): void {
    return undefined;
  }
}

function stubMatchMedia(initialMatches: boolean): MediaQueryStub {
  const watched = new StubMediaQueryList(QUERY, initialMatches);
  window.matchMedia = (query: string): MediaQueryList =>
    query === QUERY ? watched : new StubMediaQueryList(query, false);
  return {
    setMatches: (matches) => {
      watched.matches = matches;
      watched.dispatchEvent(new Event('change'));
    },
  };
}

afterEach(() => {
  window.matchMedia = ORIGINAL_MATCH_MEDIA;
});

describe('useMediaQuery', () => {
  it('reports a query that matches', () => {
    stubMatchMedia(true);

    const { result } = renderHook(() => useMediaQuery(QUERY));

    expect(result.current).toBe(true);
  });

  it('reports a query that does not match', () => {
    stubMatchMedia(false);

    const { result } = renderHook(() => useMediaQuery(QUERY));

    expect(result.current).toBe(false);
  });

  it('follows the query when the screen changes', () => {
    const media = stubMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery(QUERY));

    act(() => media.setMatches(true));

    expect(result.current).toBe(true);
  });

  it('reports no match when the browser has no matchMedia', () => {
    Object.assign(window, { matchMedia: undefined });

    const { result } = renderHook(() => useMediaQuery(QUERY));

    expect(result.current).toBe(false);
  });
});
