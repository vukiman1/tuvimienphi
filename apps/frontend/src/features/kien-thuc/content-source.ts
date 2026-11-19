import type {
  EntryFile,
  EntryKind,
  KienThucManifest,
  KienThucSearchItem,
  LessonFile,
} from '@org/shared-contracts';

export interface KienThucContentSource {
  readonly loadManifest: () => KienThucManifest;
  readonly loadLesson: (slug: string) => Promise<LessonFile | undefined>;
  readonly loadEntry: (kind: EntryKind, slug: string) => Promise<EntryFile | undefined>;
  readonly loadSearchIndex: () => Promise<readonly KienThucSearchItem[]>;
}

export type SearchIndexLoader = KienThucContentSource['loadSearchIndex'];

export const EMPTY_MANIFEST: KienThucManifest = { steps: [], entries: [] };
