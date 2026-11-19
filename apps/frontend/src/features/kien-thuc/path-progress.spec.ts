import type { KienThucManifest } from '@org/shared-contracts';
import { FIXTURE_SOURCE } from './__fixtures__/fixture-source';
import { EMPTY_MANIFEST } from './content-source';
import {
  NextInPathKind,
  ResumeKind,
  StepStatus,
  nextInPath,
  pathProgress,
  previousInPath,
  resumePoint,
  stepTrack,
} from './path-progress';

const MANIFEST: KienThucManifest = FIXTURE_SOURCE.loadManifest();
const NOTHING_READ: ReadonlySet<string> = new Set();
const STEP_ONE_READ: ReadonlySet<string> = new Set([
  'tu-vi-la-gi',
  'la-so-tu-vi-gom-nhung-gi',
  'am-duong-ngu-hanh-co-ban',
]);
const EVERYTHING_READ: ReadonlySet<string> = new Set([
  ...STEP_ONE_READ,
  '12-cung-tu-vi',
  'doc-la-so-cua-chinh-ban',
]);
const STEP_ONE_LESSON_MINUTES = 9;
const STEP_COUNT = 6;

describe('path progress', () => {
  it('starts at the first lesson when nothing is read', () => {
    const resume = resumePoint(MANIFEST, NOTHING_READ);
    expect(resume?.kind).toBe(ResumeKind.Start);
    expect(resume?.lesson.slug).toBe('tu-vi-la-gi');
    const progress = pathProgress(MANIFEST, NOTHING_READ);
    expect(progress.every((row) => row.status === StepStatus.Unread)).toBe(true);
    expect(progress[0]).toMatchObject({ lessonCount: 3, minutes: STEP_ONE_LESSON_MINUTES });
  });

  it('continues at the first unread lesson of the first unfinished step', () => {
    const progress = pathProgress(MANIFEST, STEP_ONE_READ);
    expect(progress[0].status).toBe(StepStatus.Read);
    expect(progress[1]).toMatchObject({
      status: StepStatus.Current,
      readCount: 0,
      targetSlug: '12-cung-tu-vi',
    });
    const resume = resumePoint(MANIFEST, STEP_ONE_READ);
    expect(resume).toMatchObject({ kind: ResumeKind.Continue });
    expect(resume?.kind === ResumeKind.Continue && resume.step.step).toBe(2);
    expect(resume?.lesson.slug).toBe('12-cung-tu-vi');
  });

  it('marks no step current before anything is read', () => {
    const progress = pathProgress(MANIFEST, NOTHING_READ);
    expect(progress.some((row) => row.status === StepStatus.Current)).toBe(false);
  });

  it('offers a review from the start when every lesson is read', () => {
    const resume = resumePoint(MANIFEST, EVERYTHING_READ);
    expect(resume?.kind).toBe(ResumeKind.Review);
    expect(resume?.lesson.slug).toBe('tu-vi-la-gi');
  });

  it('has no resume point without lessons', () => {
    expect(resumePoint(EMPTY_MANIFEST, NOTHING_READ)).toBeNull();
  });

  it('tracks all six steps with this lesson step current', () => {
    const track = stepTrack(MANIFEST, 2, STEP_ONE_READ);
    expect(track).toHaveLength(STEP_COUNT);
    expect(track.map((item) => item.status)).toEqual([
      StepStatus.Read,
      StepStatus.Current,
      StepStatus.Unread,
      StepStatus.Unread,
      StepStatus.Unread,
      StepStatus.Unread,
    ]);
  });

  it('goes to the next lesson in the step', () => {
    const next = nextInPath(MANIFEST, 'tu-vi-la-gi');
    expect(next.kind).toBe(NextInPathKind.Lesson);
    expect(next.kind !== NextInPathKind.End && next.lesson.slug).toBe('la-so-tu-vi-gom-nhung-gi');
  });

  it('crosses into the next step at the end of a step', () => {
    const next = nextInPath(MANIFEST, 'am-duong-ngu-hanh-co-ban');
    expect(next.kind).toBe(NextInPathKind.Step);
    expect(next.kind !== NextInPathKind.End && next.lesson.slug).toBe('12-cung-tu-vi');
  });

  it('skips steps that have no published lesson', () => {
    const next = nextInPath(MANIFEST, '12-cung-tu-vi');
    expect(next.kind).toBe(NextInPathKind.Step);
    expect(next.kind !== NextInPathKind.End && next.lesson.slug).toBe('doc-la-so-cua-chinh-ban');
  });

  it('ends the path after the last published lesson', () => {
    expect(nextInPath(MANIFEST, 'doc-la-so-cua-chinh-ban').kind).toBe(NextInPathKind.End);
  });

  it('finds the previous lesson across steps', () => {
    expect(previousInPath(MANIFEST, '12-cung-tu-vi')?.slug).toBe('am-duong-ngu-hanh-co-ban');
    expect(previousInPath(MANIFEST, 'tu-vi-la-gi')).toBeUndefined();
  });
});
