import { act, renderHook } from '@testing-library/react';
import { restoreMatchMedia, stubMatchMedia } from '@/test-utils/stub-match-media';
import { useMediaQuery } from './use-media-query';

const QUERY = '(min-width: 80rem)';

afterEach(() => {
  restoreMatchMedia();
});

describe('useMediaQuery', () => {
  it('reports a query that matches', () => {
    stubMatchMedia([QUERY]);

    const { result } = renderHook(() => useMediaQuery(QUERY));

    expect(result.current).toBe(true);
  });

  it('reports a query that does not match', () => {
    stubMatchMedia([]);

    const { result } = renderHook(() => useMediaQuery(QUERY));

    expect(result.current).toBe(false);
  });

  it('follows the query when the screen changes', () => {
    const media = stubMatchMedia([]);
    const { result } = renderHook(() => useMediaQuery(QUERY));

    act(() => media.setMatches(QUERY, true));

    expect(result.current).toBe(true);
  });

  it('reports no match when the browser has no matchMedia', () => {
    Object.assign(window, { matchMedia: undefined });

    const { result } = renderHook(() => useMediaQuery(QUERY));

    expect(result.current).toBe(false);
  });
});
