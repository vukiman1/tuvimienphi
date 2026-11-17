export enum ContentKind {
  Bai = 'bai',
  Sao = 'sao',
  Cung = 'cung',
  ThuatNgu = 'thuat-ngu',
}

export type EntryKind = ContentKind.Sao | ContentKind.Cung | ContentKind.ThuatNgu;

export enum EntryGroup {
  ChinhTinh = 'chinh-tinh',
  TuHoa = 'tu-hoa',
  PhuTinh = 'phu-tinh',
  Cung = 'cung',
  NguHanh = 'ngu-hanh',
  ThuatNgu = 'thuat-ngu',
}

export const ENTRY_GROUPS_BY_KIND: Readonly<Record<EntryKind, readonly EntryGroup[]>> = {
  [ContentKind.Sao]: [EntryGroup.ChinhTinh, EntryGroup.TuHoa, EntryGroup.PhuTinh],
  [ContentKind.Cung]: [EntryGroup.Cung],
  [ContentKind.ThuatNgu]: [EntryGroup.NguHanh, EntryGroup.ThuatNgu],
};

export type PageRef = `${ContentKind}/${string}`;

export interface ContentSection {
  readonly heading: string;
  readonly paragraphs: readonly string[];
}

export interface LessonFile {
  readonly slug: string;
  readonly step: number;
  readonly order: number;
  readonly title: string;
  readonly summary: string;
  readonly sections: readonly ContentSection[];
  readonly readingMinutes: number;
  readonly reviewedAt: string;
}

export interface EntryFile {
  readonly kind: EntryKind;
  readonly group: EntryGroup;
  readonly slug: string;
  readonly title: string;
  readonly aliases: readonly string[];
  readonly summary: string;
  readonly sections: readonly ContentSection[];
  readonly learnInLesson: string;
  readonly reviewedAt: string;
}

export interface ManifestLesson {
  readonly slug: string;
  readonly order: number;
  readonly title: string;
  readonly readingMinutes: number;
  readonly reviewedAt: string;
}

export interface ManifestStep {
  readonly step: number;
  readonly title: string;
  readonly lessons: readonly ManifestLesson[];
}

export interface ManifestEntry {
  readonly kind: EntryKind;
  readonly group: EntryGroup;
  readonly slug: string;
  readonly title: string;
  readonly learnInLesson: string;
  readonly reviewedAt: string;
}

export interface KienThucManifest {
  readonly steps: readonly ManifestStep[];
  readonly entries: readonly ManifestEntry[];
}

export interface KienThucSearchItem {
  readonly kind: ContentKind;
  readonly slug: string;
  readonly title: string;
  readonly aliases: readonly string[];
  readonly summary: string;
}

export const KIEN_THUC_MANIFEST_FILE = 'manifest.json';
export const KIEN_THUC_SEARCH_INDEX_FILE = 'search-index.json';
export const CONTENT_SLUG_MAX_LENGTH = 80;
export const RESERVED_LESSON_SEGMENTS: readonly string[] = ['sao', 'cung', 'thuat-ngu'];

const CONTENT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RESERVED_LESSON_YEAR_PATTERN = /^tu-vi-\d{4}$/;

function isContentKind(value: string): value is ContentKind {
  return (Object.values(ContentKind) as string[]).includes(value);
}

export function isContentSlug(slug: string): boolean {
  return slug.length <= CONTENT_SLUG_MAX_LENGTH && CONTENT_SLUG_PATTERN.test(slug);
}

export function isReservedLessonSlug(slug: string): boolean {
  return RESERVED_LESSON_SEGMENTS.includes(slug) || RESERVED_LESSON_YEAR_PATTERN.test(slug);
}

export function contentFilePath(kind: ContentKind, slug: string): string {
  return `${kind}/${slug}.json`;
}

export function pageRef(kind: ContentKind, slug: string): PageRef {
  return `${kind}/${slug}`;
}

export function parsePageRef(
  text: string,
): { readonly kind: ContentKind; readonly slug: string } | null {
  const slash = text.indexOf('/');
  if (slash < 0) {
    return null;
  }
  const kind = text.slice(0, slash);
  const slug = text.slice(slash + 1);
  if (!isContentKind(kind) || !isContentSlug(slug)) {
    return null;
  }
  return { kind, slug };
}
