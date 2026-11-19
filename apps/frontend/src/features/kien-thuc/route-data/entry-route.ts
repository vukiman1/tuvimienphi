import { pageRef } from '@org/shared-contracts';
import type { EntryFile, EntryKind, KienThucManifest } from '@org/shared-contracts';
import type { KienThucContentSource } from '../content-source';
import { isPublished } from '../published-pages';
import { KienThucPageStatus } from './kien-thuc-page-status';

export type EntryPageData =
  | {
      readonly status: KienThucPageStatus.Found;
      readonly entry: EntryFile;
      readonly manifest: KienThucManifest;
    }
  | { readonly status: KienThucPageStatus.NotFound };

const NOT_FOUND: EntryPageData = { status: KienThucPageStatus.NotFound };

export async function loadEntryPage(
  kind: EntryKind,
  slug: string,
  source: KienThucContentSource,
): Promise<EntryPageData> {
  const manifest = source.loadManifest();
  if (!isPublished(manifest, pageRef(kind, slug))) {
    return NOT_FOUND;
  }
  const entry = await source.loadEntry(kind, slug);
  return entry ? { status: KienThucPageStatus.Found, entry, manifest } : NOT_FOUND;
}
