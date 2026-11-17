import { ContentKind, pageRef, type EntryGroup, type PageRef } from '@org/shared-contracts';
import { plannedPage, type PlannedPage } from '@org/shared-kien-thuc';
import { readContent, type ContentFiles } from '../store/content-store';
import { readAllDrafts, type StoredDraft } from '../store/draft-store';
import type { KienThucDirectories } from '../store/kien-thuc-paths';
import type { CorpusPage } from '../validate/check-similarity';
import { bodyPlainText } from '../validate/validate-page';

export function groupOf(page: PlannedPage): EntryGroup | null {
  return page.kind === ContentKind.Bai ? null : page.group;
}

export function corpusOf(
  content: ContentFiles,
  drafts: readonly StoredDraft[],
): readonly CorpusPage[] {
  const drafted = new Set<PageRef>(drafts.map((stored) => stored.ref));
  const pages: CorpusPage[] = [];
  for (const lesson of content.lessons) {
    const ref = pageRef(ContentKind.Bai, lesson.slug);
    if (drafted.has(ref)) continue;
    pages.push({ ref, group: null, plainText: bodyPlainText(lesson) });
  }
  for (const entry of content.entries) {
    const ref = pageRef(entry.kind, entry.slug);
    if (drafted.has(ref)) continue;
    pages.push({ ref, group: entry.group, plainText: bodyPlainText(entry) });
  }
  for (const stored of drafts) {
    const page = plannedPage(stored.ref);
    pages.push({
      ref: stored.ref,
      group: page === undefined ? null : groupOf(page),
      plainText: bodyPlainText(stored.draft),
    });
  }
  return pages;
}

export async function buildCorpus(
  directories: KienThucDirectories,
  exclude?: PageRef,
): Promise<readonly CorpusPage[]> {
  const pages = corpusOf(await readContent(directories.content), await readAllDrafts(directories));
  return exclude === undefined ? pages : pages.filter((page) => page.ref !== exclude);
}
