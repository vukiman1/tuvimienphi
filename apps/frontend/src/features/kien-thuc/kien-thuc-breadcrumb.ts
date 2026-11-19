import type { EntryFile, EntryKind } from '@org/shared-contracts';
import type { BreadcrumbItem } from '@/lib/seo';
import { GROUP_LABEL, KIND_INDEX_TITLE } from './components/kien-thuc-labels';
import { KIEN_THUC_PATH, entryPath, indexPath, lessonPath } from './kien-thuc-paths';

const KIEN_THUC_CRUMB: BreadcrumbItem = { name: 'Kiến thức', path: KIEN_THUC_PATH };

export function lessonBreadcrumb(slug: string, title: string): readonly BreadcrumbItem[] {
  return [KIEN_THUC_CRUMB, { name: title, path: lessonPath(slug) }];
}

export function entryBreadcrumb(entry: EntryFile): readonly BreadcrumbItem[] {
  return [
    KIEN_THUC_CRUMB,
    { name: GROUP_LABEL[entry.group], path: indexPath(entry.kind) },
    { name: entry.title, path: entryPath(entry.kind, entry.slug) },
  ];
}

export function indexBreadcrumb(kind: EntryKind): readonly BreadcrumbItem[] {
  return [KIEN_THUC_CRUMB, { name: KIND_INDEX_TITLE[kind], path: indexPath(kind) }];
}
