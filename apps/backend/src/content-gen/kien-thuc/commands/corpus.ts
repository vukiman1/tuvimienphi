import { ContentKind, pageRef, type EntryGroup, type PageRef } from '@org/shared-contracts';
import { plannedPage, type PlannedPage } from '@org/shared-kien-thuc';
import { readContent } from '../store/content-store';
import { readAllDrafts } from '../store/draft-store';
import type { KienThucDirectories } from '../store/kien-thuc-paths';
import type { CorpusPage } from '../validate/check-similarity';
import { bodyPlainText } from '../validate/validate-page';

export function groupOf(page: PlannedPage): EntryGroup | null {
  return page.kind === ContentKind.Bai ? null : page.group;
}

export async function buildCorpus(
  directories: KienThucDirectories,
  exclude?: PageRef,
): Promise<readonly CorpusPage[]> {
  const content = await readContent(directories.content);
  const drafts = await readAllDrafts(directories);
  const pages: CorpusPage[] = [];
  for (const lesson of content.lessons) {
    pages.push({
      ref: pageRef(ContentKind.Bai, lesson.slug),
      group: null,
      plainText: bodyPlainText(lesson),
    });
  }
  for (const entry of content.entries) {
    pages.push({
      ref: pageRef(entry.kind, entry.slug),
      group: entry.group,
      plainText: bodyPlainText(entry),
    });
  }
  for (const stored of drafts) {
    const page = plannedPage(stored.ref);
    pages.push({
      ref: stored.ref,
      group: page === undefined ? null : groupOf(page),
      plainText: bodyPlainText(stored.draft),
    });
  }
  return exclude === undefined ? pages : pages.filter((page) => page.ref !== exclude);
}
