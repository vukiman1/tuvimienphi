import type { KienThucManifest, ManifestStep } from '@org/shared-contracts';
import { publishedLessons, stepsWithLessons } from './published-pages';
import type { PublishedLesson } from './published-pages';

export enum StepStatus {
  Read = 'read',
  Current = 'current',
  Unread = 'unread',
}

export interface StepProgress {
  readonly step: ManifestStep;
  readonly status: StepStatus;
  readonly readCount: number;
  readonly lessonCount: number;
  readonly minutes: number;
  readonly targetSlug: string;
}

export interface TrackedStep {
  readonly step: ManifestStep;
  readonly status: StepStatus;
}

export enum ResumeKind {
  Start = 'start',
  Continue = 'continue',
  Review = 'review',
}

export type Resume =
  | { readonly kind: ResumeKind.Start | ResumeKind.Review; readonly lesson: PublishedLesson }
  | {
      readonly kind: ResumeKind.Continue;
      readonly step: ManifestStep;
      readonly lesson: PublishedLesson;
    };

export enum NextInPathKind {
  Lesson = 'lesson',
  Step = 'step',
  End = 'end',
}

export type NextInPath =
  | { readonly kind: NextInPathKind.Lesson; readonly lesson: PublishedLesson }
  | { readonly kind: NextInPathKind.Step; readonly lesson: PublishedLesson }
  | { readonly kind: NextInPathKind.End };

function readCountOf(step: ManifestStep, readSlugs: ReadonlySet<string>): number {
  return step.lessons.filter((lesson) => readSlugs.has(lesson.slug)).length;
}

function statusOf(
  step: ManifestStep,
  currentStep: ManifestStep | undefined,
  readSlugs: ReadonlySet<string>,
): StepStatus {
  if (isStepRead(step, readSlugs)) {
    return StepStatus.Read;
  }
  return step === currentStep ? StepStatus.Current : StepStatus.Unread;
}

function isStepRead(step: ManifestStep, readSlugs: ReadonlySet<string>): boolean {
  return step.lessons.length > 0 && readCountOf(step, readSlugs) === step.lessons.length;
}

function firstUnreadSlug(step: ManifestStep, readSlugs: ReadonlySet<string>): string {
  const unread = step.lessons.find((lesson) => !readSlugs.has(lesson.slug));
  return (unread ?? step.lessons[0]).slug;
}

function hasReadAnyLesson(manifest: KienThucManifest, readSlugs: ReadonlySet<string>): boolean {
  return publishedLessons(manifest).some((lesson) => readSlugs.has(lesson.slug));
}

function firstUnfinishedStep(
  manifest: KienThucManifest,
  readSlugs: ReadonlySet<string>,
): ManifestStep | undefined {
  return stepsWithLessons(manifest).find((step) => !isStepRead(step, readSlugs));
}

function lessonBySlug(manifest: KienThucManifest, slug: string): PublishedLesson | undefined {
  return publishedLessons(manifest).find((lesson) => lesson.slug === slug);
}

export function pathProgress(
  manifest: KienThucManifest,
  readSlugs: ReadonlySet<string>,
): readonly StepProgress[] {
  const currentStep = hasReadAnyLesson(manifest, readSlugs)
    ? firstUnfinishedStep(manifest, readSlugs)
    : undefined;
  return stepsWithLessons(manifest).map((step) => ({
    step,
    status: statusOf(step, currentStep, readSlugs),
    readCount: readCountOf(step, readSlugs),
    lessonCount: step.lessons.length,
    minutes: step.lessons.reduce((total, lesson) => total + lesson.readingMinutes, 0),
    targetSlug: firstUnreadSlug(step, readSlugs),
  }));
}

export function resumePoint(
  manifest: KienThucManifest,
  readSlugs: ReadonlySet<string>,
): Resume | null {
  const [firstLesson] = publishedLessons(manifest);
  if (!firstLesson) {
    return null;
  }
  const unfinishedStep = firstUnfinishedStep(manifest, readSlugs);
  if (!unfinishedStep) {
    return { kind: ResumeKind.Review, lesson: firstLesson };
  }
  if (!hasReadAnyLesson(manifest, readSlugs)) {
    return { kind: ResumeKind.Start, lesson: firstLesson };
  }
  const lesson = lessonBySlug(manifest, firstUnreadSlug(unfinishedStep, readSlugs));
  return lesson
    ? { kind: ResumeKind.Continue, step: unfinishedStep, lesson }
    : { kind: ResumeKind.Start, lesson: firstLesson };
}

export function stepTrack(
  manifest: KienThucManifest,
  currentStep: number,
  readSlugs: ReadonlySet<string>,
): readonly TrackedStep[] {
  return manifest.steps.map((step) => {
    if (step.step === currentStep) {
      return { step, status: StepStatus.Current };
    }
    return { step, status: isStepRead(step, readSlugs) ? StepStatus.Read : StepStatus.Unread };
  });
}

export function nextInPath(manifest: KienThucManifest, slug: string): NextInPath {
  const lessons = publishedLessons(manifest);
  const position = lessons.findIndex((lesson) => lesson.slug === slug);
  const next = position < 0 ? undefined : lessons[position + 1];
  if (!next) {
    return { kind: NextInPathKind.End };
  }
  const kind = next.step === lessons[position].step ? NextInPathKind.Lesson : NextInPathKind.Step;
  return { kind, lesson: next };
}

export function previousInPath(
  manifest: KienThucManifest,
  slug: string,
): PublishedLesson | undefined {
  const lessons = publishedLessons(manifest);
  const position = lessons.findIndex((lesson) => lesson.slug === slug);
  return position > 0 ? lessons[position - 1] : undefined;
}
