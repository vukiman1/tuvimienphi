export interface MatchMediaStub {
  readonly setMatches: (query: string, matches: boolean) => void;
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

const ORIGINAL_MATCH_MEDIA = window.matchMedia;

export function stubMatchMedia(matchingQueries: readonly string[]): MatchMediaStub {
  const lists = new Map<string, StubMediaQueryList>();
  const listFor = (query: string): StubMediaQueryList => {
    const known = lists.get(query);
    if (known) return known;
    const created = new StubMediaQueryList(query, matchingQueries.includes(query));
    lists.set(query, created);
    return created;
  };
  window.matchMedia = listFor;
  return {
    setMatches: (query, matches) => {
      const list = listFor(query);
      list.matches = matches;
      list.dispatchEvent(new Event('change'));
    },
  };
}

export function restoreMatchMedia(): void {
  window.matchMedia = ORIGINAL_MATCH_MEDIA;
}
