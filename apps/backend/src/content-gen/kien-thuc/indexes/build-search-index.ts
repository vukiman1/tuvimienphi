import { ContentKind, type KienThucSearchItem } from '@org/shared-contracts';
import type { ContentFiles } from '../store/content-store';

export function buildSearchIndex(files: ContentFiles): readonly KienThucSearchItem[] {
  const lessons: readonly KienThucSearchItem[] = files.lessons.map((lesson) => ({
    kind: ContentKind.Bai,
    slug: lesson.slug,
    title: lesson.title,
    aliases: [],
    summary: lesson.summary,
  }));
  const entries: readonly KienThucSearchItem[] = files.entries.map((entry) => ({
    kind: entry.kind,
    slug: entry.slug,
    title: entry.title,
    aliases: entry.aliases,
    summary: entry.summary,
  }));
  return [...lessons, ...entries];
}
