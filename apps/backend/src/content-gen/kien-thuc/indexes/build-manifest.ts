import {
  ContentKind,
  pageRef,
  type EntryFile,
  type KienThucManifest,
  type LessonFile,
  type ManifestEntry,
  type ManifestLesson,
  type ManifestStep,
  type PageRef,
} from '@org/shared-contracts';
import { KIEN_THUC_ENTRIES, KIEN_THUC_LESSONS, KIEN_THUC_STEPS } from '@org/shared-kien-thuc';
import { UnplannedContentError } from '../errors';
import type { ContentFiles } from '../store/content-store';

const PLANNED_LESSON_SLUGS: ReadonlySet<string> = new Set(KIEN_THUC_LESSONS.map((l) => l.slug));
const ENTRY_PLAN_ORDER: ReadonlyMap<PageRef, number> = new Map(
  KIEN_THUC_ENTRIES.map((entry, index) => [pageRef(entry.kind, entry.slug), index]),
);

function toManifestLesson(lesson: LessonFile): ManifestLesson {
  return {
    slug: lesson.slug,
    order: lesson.order,
    title: lesson.title,
    readingMinutes: lesson.readingMinutes,
    reviewedAt: lesson.reviewedAt,
  };
}

function toManifestEntry(entry: EntryFile): ManifestEntry {
  return {
    kind: entry.kind,
    group: entry.group,
    slug: entry.slug,
    title: entry.title,
    learnInLesson: entry.learnInLesson,
    reviewedAt: entry.reviewedAt,
  };
}

function planIndexOf(entry: EntryFile): number {
  const order = ENTRY_PLAN_ORDER.get(pageRef(entry.kind, entry.slug));
  if (order === undefined) throw new UnplannedContentError(pageRef(entry.kind, entry.slug));
  return order;
}

export function buildManifest(files: ContentFiles): KienThucManifest {
  for (const lesson of files.lessons) {
    if (!PLANNED_LESSON_SLUGS.has(lesson.slug)) {
      throw new UnplannedContentError(pageRef(ContentKind.Bai, lesson.slug));
    }
  }
  const steps: readonly ManifestStep[] = KIEN_THUC_STEPS.map((step) => ({
    step: step.step,
    title: step.title,
    lessons: files.lessons
      .filter((lesson) => lesson.step === step.step)
      .sort((a, b) => a.order - b.order)
      .map(toManifestLesson),
  }));
  const entries: readonly ManifestEntry[] = [...files.entries]
    .map((entry) => ({ entry, index: planIndexOf(entry) }))
    .sort((a, b) => a.index - b.index)
    .map((item) => toManifestEntry(item.entry));
  return { steps, entries };
}
