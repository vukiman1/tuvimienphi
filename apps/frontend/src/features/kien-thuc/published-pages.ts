import { ContentKind, ENTRY_GROUPS_BY_KIND, parsePageRef } from '@org/shared-contracts';
import type {
  EntryGroup,
  EntryKind,
  KienThucManifest,
  ManifestEntry,
  ManifestLesson,
  ManifestStep,
  PageRef,
} from '@org/shared-contracts';

export interface PublishedLesson extends ManifestLesson {
  readonly step: number;
  readonly stepTitle: string;
  readonly position: number;
  readonly stepLessonCount: number;
}

export function publishedLessons(manifest: KienThucManifest): readonly PublishedLesson[] {
  return manifest.steps.flatMap((step) =>
    step.lessons.map((lesson, index) => ({
      ...lesson,
      step: step.step,
      stepTitle: step.title,
      position: index + 1,
      stepLessonCount: step.lessons.length,
    })),
  );
}

export function publishedLesson(
  manifest: KienThucManifest,
  slug: string,
): PublishedLesson | undefined {
  return publishedLessons(manifest).find((lesson) => lesson.slug === slug);
}

export function stepsWithLessons(manifest: KienThucManifest): readonly ManifestStep[] {
  return manifest.steps.filter((step) => step.lessons.length > 0);
}

export function entriesOfKind(
  manifest: KienThucManifest,
  kind: EntryKind,
): readonly ManifestEntry[] {
  return manifest.entries.filter((entry) => entry.kind === kind);
}

export function groupsWithEntries(
  manifest: KienThucManifest,
  kind: EntryKind,
): readonly EntryGroup[] {
  const entries = entriesOfKind(manifest, kind);
  return ENTRY_GROUPS_BY_KIND[kind].filter((group) =>
    entries.some((entry) => entry.group === group),
  );
}

export function publishedTitle(manifest: KienThucManifest, ref: PageRef): string | undefined {
  const parsed = parsePageRef(ref);
  if (!parsed) {
    return undefined;
  }
  if (parsed.kind === ContentKind.Bai) {
    return publishedLesson(manifest, parsed.slug)?.title;
  }
  return entriesOfKind(manifest, parsed.kind).find((entry) => entry.slug === parsed.slug)?.title;
}

export function isPublished(manifest: KienThucManifest, ref: PageRef): boolean {
  return publishedTitle(manifest, ref) !== undefined;
}
