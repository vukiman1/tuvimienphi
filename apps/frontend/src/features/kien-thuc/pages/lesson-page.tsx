import { Fragment, lazy, Suspense, useMemo } from 'react';
import type { ReactElement } from 'react';
import { ContentKind, pageRef } from '@org/shared-contracts';
import type { ContentSection, KienThucManifest, LessonFile } from '@org/shared-contracts';
import { BookOpen, Clock, Sparkle } from 'lucide-react';
import {
  Breadcrumb,
  Chip,
  DisplaySize,
  PageHero,
  PaintingFocus,
  ReadingZone,
  TextLink,
} from '@/design-system';
import { sectionId } from '../active-section';
import { KienThucCta } from '../components/kien-thuc-cta';
import { LessonToc } from '../components/lesson-toc';
import {
  SAMPLE_BOARD_PLACEHOLDER_CLASS,
  SAMPLE_CHART_LESSON_SLUG,
} from '../components/sample-chart-board.constants';
import { MethodologyNote } from '../components/methodology-note';
import { NextInPathCard } from '../components/next-in-path-card';
import { SectionHeading } from '../components/section-heading';
import { StepTrack } from '../components/step-track';
import type { SearchIndexLoader } from '../content-source';
import { lessonBreadcrumb } from '../kien-thuc-breadcrumb';
import { OWNER_READ_REFS } from '../owner-read-refs';
import { nextInPath, previousInPath, stepTrack } from '../path-progress';
import { LessonEndSlot } from '../progress/lesson-end-slot';
import { useLessonProgress } from '../progress/use-lesson-progress';
import { ProseParagraph } from '../prose/prose-paragraph';
import { ProseProvider } from '../prose/prose-context';
import { publishedLesson } from '../published-pages';
import type { PublishedLesson } from '../published-pages';
import { formatReviewedAt } from '../reviewed-date';
import { useActiveSection } from '../use-active-section';
import { KIEN_THUC_PAINTING } from '../kien-thuc-media';

const SampleChartBoard = lazy(() =>
  import('../components/sample-chart-board').then((module) => ({
    default: module.SampleChartBoard,
  })),
);

const SAMPLE_BOARD_AFTER_SECTION_INDEX = 0;
const LESSON_ROUTE = '/kien-thuc/$slug';
const BYLINE = 'Biên soạn: Admin';
const META_SEPARATOR = ' · ';
const META_ICON_CLASS = 'size-4 shrink-0 stroke-dawn';

export class LessonNotInManifestError extends Error {
  constructor(readonly slug: string) {
    super(`Lesson "${slug}" was rendered but is not published in the manifest`);
    this.name = 'LessonNotInManifestError';
  }
}

interface LessonPageProps {
  readonly lesson: LessonFile;
  readonly manifest: KienThucManifest;
  readonly loadSearchIndex: SearchIndexLoader;
}

interface LessonHeroProps {
  readonly lesson: LessonFile;
  readonly published: PublishedLesson;
  readonly manifest: KienThucManifest;
}

interface LessonSectionProps {
  readonly id: string;
  readonly section: ContentSection;
}

function LessonHero({ lesson, published, manifest }: LessonHeroProps): ReactElement {
  const { readSlugs } = useLessonProgress();
  return (
    <PageHero
      breadcrumb={
        <div className="flex flex-col items-start gap-4">
          <Breadcrumb items={lessonBreadcrumb(lesson.slug, lesson.title)} />
          <Chip>
            <Sparkle aria-hidden="true" className="mr-2 size-5 shrink-0 fill-gold stroke-0" />
            {`Bước ${published.step}/${manifest.steps.length} · ${published.stepTitle}`}
          </Chip>
        </div>
      }
      title={lesson.title}
      painting={KIEN_THUC_PAINTING}
      paintingFocus={PaintingFocus.Whole}
    >
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-day-soft">
        <span className="inline-flex items-center gap-2">
          <BookOpen aria-hidden="true" className={META_ICON_CLASS} />
          {`Bài ${published.position}/${published.stepLessonCount}`}
        </span>
        <span>{META_SEPARATOR}</span>
        <span className="inline-flex items-center gap-2">
          <Clock aria-hidden="true" className={META_ICON_CLASS} />
          {`${lesson.readingMinutes} phút đọc`}
        </span>
        <span>{META_SEPARATOR}</span>
        <span>
          {'Cập nhật '}
          <time dateTime={lesson.reviewedAt}>{formatReviewedAt(lesson.reviewedAt)}</time>
          {`${META_SEPARATOR}${BYLINE}`}
        </span>
      </p>
      <StepTrack steps={stepTrack(manifest, published.step, readSlugs)} />
    </PageHero>
  );
}

function LessonSection({ id, section }: LessonSectionProps): ReactElement {
  const titleId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={titleId} className="scroll-mt-6">
      <SectionHeading id={titleId}>{section.heading}</SectionHeading>
      <div className="mt-4 flex flex-col gap-4">
        {section.paragraphs.map((paragraph, index) => (
          <ProseParagraph key={index} text={paragraph} />
        ))}
      </div>
    </section>
  );
}

export function LessonPage({ lesson, manifest, loadSearchIndex }: LessonPageProps): ReactElement {
  const sectionIds = useMemo(
    () => lesson.sections.map((_, index) => sectionId(index)),
    [lesson.sections],
  );
  const activeIndex = useActiveSection(sectionIds);
  const published = publishedLesson(manifest, lesson.slug);
  if (!published) {
    throw new LessonNotInManifestError(lesson.slug);
  }
  const previous = previousInPath(manifest, lesson.slug);
  const hasSampleBoard = lesson.slug === SAMPLE_CHART_LESSON_SLUG;

  return (
    <main className="w-full bg-day">
      <LessonHero lesson={lesson} published={published} manifest={manifest} />
      <section className="px-4 py-10 md:px-6 md:py-14">
        <div className="mx-auto max-w-6xl lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-10">
          <LessonToc
            headings={lesson.sections.map((section) => section.heading)}
            activeIndex={activeIndex}
          />
          <ReadingZone>
            <div className="flex flex-col gap-12">
              <ProseProvider manifest={manifest} loadSearchIndex={loadSearchIndex}>
                {lesson.sections.map((section, index) => (
                  <Fragment key={sectionIds[index]}>
                    <LessonSection id={sectionIds[index]} section={section} />
                    {hasSampleBoard && index === SAMPLE_BOARD_AFTER_SECTION_INDEX && (
                      <Suspense fallback={<div className={SAMPLE_BOARD_PLACEHOLDER_CLASS} />}>
                        <SampleChartBoard />
                      </Suspense>
                    )}
                  </Fragment>
                ))}
              </ProseProvider>
              <div className="flex flex-col items-start gap-4">
                <NextInPathCard slug={lesson.slug} next={nextInPath(manifest, lesson.slug)} />
                {previous && (
                  <TextLink to={LESSON_ROUTE} params={{ slug: previous.slug }}>
                    {`← Bài trước: ${previous.title}`}
                  </TextLink>
                )}
              </div>
              <LessonEndSlot />
              <MethodologyNote
                hasFacts={false}
                reviewedAt={lesson.reviewedAt}
                isOwnerRead={OWNER_READ_REFS.includes(pageRef(ContentKind.Bai, lesson.slug))}
              />
              <KienThucCta titleSize={DisplaySize.Panel} />
            </div>
          </ReadingZone>
        </div>
      </section>
    </main>
  );
}
