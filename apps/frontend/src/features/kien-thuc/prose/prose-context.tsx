import { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { pageRef } from '@org/shared-contracts';
import type { KienThucManifest, KienThucSearchItem, PageRef } from '@org/shared-contracts';
import type { SearchIndexLoader } from '../content-source';

export interface ProseContextValue {
  readonly manifest: KienThucManifest;
  readonly loadSearchIndex: SearchIndexLoader;
}

interface ProseProviderProps extends ProseContextValue {
  readonly children: ReactNode;
}

interface ProseState {
  readonly manifest: KienThucManifest;
  readonly openTermId: string | undefined;
  readonly summaries: ReadonlyMap<PageRef, string>;
  readonly openTerm: (termId: string) => void;
  readonly closeTerm: () => void;
}

export class MissingProseProviderError extends Error {
  constructor() {
    super('Prose terms were rendered outside a ProseProvider');
    this.name = 'MissingProseProviderError';
  }
}

const NO_SUMMARIES: ReadonlyMap<PageRef, string> = new Map();

const ProseContext = createContext<ProseState | undefined>(undefined);

function summariesOf(items: readonly KienThucSearchItem[]): ReadonlyMap<PageRef, string> {
  return new Map(items.map((item) => [pageRef(item.kind, item.slug), item.summary]));
}

export function ProseProvider({
  manifest,
  loadSearchIndex,
  children,
}: ProseProviderProps): ReactElement {
  const [openTermId, setOpenTermId] = useState<string | undefined>(undefined);
  const [summaries, setSummaries] = useState<ReadonlyMap<PageRef, string>>(NO_SUMMARIES);
  const hasRequestedIndexRef = useRef(false);

  const openTerm = useCallback(
    (termId: string): void => {
      setOpenTermId(termId);
      if (hasRequestedIndexRef.current) {
        return;
      }
      hasRequestedIndexRef.current = true;
      loadSearchIndex().then(
        (items) => setSummaries(summariesOf(items)),
        () => {
          hasRequestedIndexRef.current = false;
        },
      );
    },
    [loadSearchIndex],
  );

  const closeTerm = useCallback((): void => setOpenTermId(undefined), []);

  return (
    <ProseContext.Provider value={{ manifest, openTermId, summaries, openTerm, closeTerm }}>
      {children}
    </ProseContext.Provider>
  );
}

export function useProse(): ProseState {
  const state = useContext(ProseContext);
  if (!state) {
    throw new MissingProseProviderError();
  }
  return state;
}
