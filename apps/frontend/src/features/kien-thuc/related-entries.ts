import { ContentKind, parsePageRef } from '@org/shared-contracts';
import type { KienThucManifest, ManifestEntry, PageRef } from '@org/shared-contracts';
import { entriesOfKind } from './published-pages';

export const RELATED_ENTRY_COUNT = 6;

export function relatedEntries(manifest: KienThucManifest, ref: PageRef): readonly ManifestEntry[] {
  const parsed = parsePageRef(ref);
  if (!parsed || parsed.kind === ContentKind.Bai) {
    return [];
  }
  const entries = entriesOfKind(manifest, parsed.kind);
  const position = entries.findIndex((entry) => entry.slug === parsed.slug);
  if (position < 0) {
    return [];
  }
  const following = [...entries.slice(position + 1), ...entries.slice(0, position)];
  return following.slice(0, RELATED_ENTRY_COUNT);
}
