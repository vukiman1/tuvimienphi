import { pageRef } from '@org/shared-contracts';
import type { EntryGroup, EntryKind, ManifestEntry } from '@org/shared-contracts';
import type { KienThucContentSource } from '../content-source';
import { entriesOfKind, groupsWithEntries } from '../published-pages';
import { KienThucPageStatus } from './kien-thuc-page-status';
import { MissingIndexSummaryError } from './missing-index-summary-error';

export interface IndexTile {
  readonly entry: ManifestEntry;
  readonly summary: string;
}

export interface IndexGroup {
  readonly group: EntryGroup;
  readonly tiles: readonly IndexTile[];
}

export type FoundIndexPageData = {
  readonly status: KienThucPageStatus.Found;
  readonly kind: EntryKind;
  readonly groups: readonly IndexGroup[];
};

export type IndexPageData = FoundIndexPageData | { readonly status: KienThucPageStatus.NotFound };

const NOT_FOUND: IndexPageData = { status: KienThucPageStatus.NotFound };

export async function loadIndexPage(
  kind: EntryKind,
  source: KienThucContentSource,
): Promise<IndexPageData> {
  const manifest = source.loadManifest();
  const groups = groupsWithEntries(manifest, kind);
  if (groups.length === 0) {
    return NOT_FOUND;
  }
  const searchIndex = await source.loadSearchIndex();
  const summaryByRef = new Map(
    searchIndex.map((item) => [pageRef(item.kind, item.slug), item.summary]),
  );
  const entries = entriesOfKind(manifest, kind);

  return {
    status: KienThucPageStatus.Found,
    kind,
    groups: groups.map((group) => ({
      group,
      tiles: entries
        .filter((entry) => entry.group === group)
        .map((entry) => {
          const ref = pageRef(entry.kind, entry.slug);
          const summary = summaryByRef.get(ref);
          if (summary === undefined) {
            throw new MissingIndexSummaryError(ref);
          }
          return { entry, summary };
        }),
    })),
  };
}
