import {
  ContentKind,
  KIEN_THUC_MANIFEST_FILE,
  KIEN_THUC_SEARCH_INDEX_FILE,
  contentFilePath,
} from '@org/shared-contracts';
import type {
  EntryFile,
  EntryKind,
  KienThucManifest,
  KienThucSearchItem,
  LessonFile,
} from '@org/shared-contracts';
import { EMPTY_MANIFEST } from './content-source';
import type { KienThucContentSource } from './content-source';
import { cacheUntilRejected } from './search/cache-until-rejected';

type ContentLoaders<T> = Readonly<Record<string, () => Promise<T>>>;

const MANIFEST_FILES = import.meta.glob<KienThucManifest>('./content/manifest.json', {
  eager: true,
  import: 'default',
});

const LESSON_LOADERS: ContentLoaders<LessonFile> = import.meta.glob<LessonFile>(
  './content/bai/*.json',
  { import: 'default' },
);

const ENTRY_LOADERS: ContentLoaders<EntryFile> = import.meta.glob<EntryFile>(
  ['./content/sao/*.json', './content/cung/*.json', './content/thuat-ngu/*.json'],
  { import: 'default' },
);

const SEARCH_INDEX_LOADERS: ContentLoaders<readonly KienThucSearchItem[]> = import.meta.glob<
  readonly KienThucSearchItem[]
>('./content/search-index.json', { import: 'default' });

function contentKey(fileName: string): string {
  return `./content/${fileName}`;
}

async function loadContent<T>(
  loaders: ContentLoaders<T>,
  kind: ContentKind,
  slug: string,
): Promise<T | undefined> {
  const load = loaders[contentKey(contentFilePath(kind, slug))];
  return load ? load() : undefined;
}

function loadManifest(): KienThucManifest {
  return MANIFEST_FILES[contentKey(KIEN_THUC_MANIFEST_FILE)] ?? EMPTY_MANIFEST;
}

function loadLesson(slug: string): Promise<LessonFile | undefined> {
  return loadContent(LESSON_LOADERS, ContentKind.Bai, slug);
}

function loadEntry(kind: EntryKind, slug: string): Promise<EntryFile | undefined> {
  return loadContent(ENTRY_LOADERS, kind, slug);
}

async function readSearchIndex(): Promise<readonly KienThucSearchItem[]> {
  const load = SEARCH_INDEX_LOADERS[contentKey(KIEN_THUC_SEARCH_INDEX_FILE)];
  return load ? load() : [];
}

const loadSearchIndex = cacheUntilRejected(readSearchIndex);

export const KIEN_THUC_SOURCE: KienThucContentSource = {
  loadManifest,
  loadLesson,
  loadEntry,
  loadSearchIndex,
};
