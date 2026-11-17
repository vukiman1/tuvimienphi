import { ContentKind, type PageRef } from '@org/shared-contracts';
import { CHI } from '@org/shared-tu-vi';
import {
  castSampleChart,
  KIEN_THUC_ENTRIES,
  KIEN_THUC_LESSONS,
  plannedRefOf,
  type PlannedLesson,
  type PlannedPage,
} from '@org/shared-kien-thuc';
import { limitsFor } from '../validate/check-shape';
import { isSampleChartLesson } from '../validate/facts/check-sample-chart';
import { cungBriefLines, cungRequiredMentions } from './cung-brief';
import { lessonFactLines } from './lesson-facts';
import { LESSON_OUTLINES } from './lesson-outlines';
import type { LinkTarget, PageBrief } from './page-brief';
import { saoBriefLines, saoRequiredMentions } from './sao-brief';
import { termBriefLines, termRequiredMentions } from './term-brief';

function allPlannedPages(): readonly PlannedPage[] {
  return [...KIEN_THUC_LESSONS, ...KIEN_THUC_ENTRIES];
}

function linkTargetOf(page: PlannedPage): LinkTarget {
  return { ref: plannedRefOf(page), title: page.title };
}

function sortedLessons(): readonly PlannedLesson[] {
  return [...KIEN_THUC_LESSONS].sort((a, b) => a.step - b.step || a.order - b.order);
}

function sampleChartMentions(): readonly string[] {
  const chart = castSampleChart();
  const menh = chart.cungs.find((cung) => cung.isMenh);
  const than = chart.cungs.find((cung) => cung.isThan);
  const mentions: string[] = [chart.cuc.name];
  if (menh !== undefined) {
    mentions.push(...menh.chinhTinh.map((star) => star.name));
    mentions.push(CHI[menh.chiIndex]);
  }
  if (than !== undefined) mentions.push(than.name);
  return mentions;
}

function neighboursOf(lesson: PlannedLesson): {
  previous: LinkTarget | null;
  next: LinkTarget | null;
} {
  const lessons = sortedLessons();
  const index = lessons.findIndex((item) => item.slug === lesson.slug);
  return {
    previous: index > 0 ? linkTargetOf(lessons[index - 1]) : null,
    next: index >= 0 && index < lessons.length - 1 ? linkTargetOf(lessons[index + 1]) : null,
  };
}

function ownedElsewhere(selfRef: PageRef): readonly LinkTarget[] {
  const targets: LinkTarget[] = [];
  for (const lesson of KIEN_THUC_LESSONS) {
    const ref = plannedRefOf(lesson);
    if (ref === selfRef) continue;
    for (const concept of lesson.ownedConcepts) targets.push({ ref, title: concept });
  }
  return targets;
}

function teachingLessonOf(learnInLesson: string): LinkTarget | null {
  const lesson = KIEN_THUC_LESSONS.find((item) => item.slug === learnInLesson);
  return lesson === undefined ? null : linkTargetOf(lesson);
}

interface Content {
  readonly factLines: readonly string[];
  readonly mustCover: readonly string[];
  readonly requiredMentions: readonly string[];
}

function contentOf(page: PlannedPage): Content {
  switch (page.kind) {
    case ContentKind.Bai: {
      const outline = LESSON_OUTLINES[page.slug];
      const extras = isSampleChartLesson(page) ? sampleChartMentions() : [];
      return {
        factLines: lessonFactLines(page),
        mustCover: outline?.mustCover ?? [],
        requiredMentions: [...(outline?.requiredMentions ?? []), ...extras],
      };
    }
    case ContentKind.Sao:
      return {
        factLines: saoBriefLines(page.star),
        mustCover: [],
        requiredMentions: saoRequiredMentions(page.star),
      };
    case ContentKind.Cung:
      return {
        factLines: cungBriefLines(page.cung),
        mustCover: [],
        requiredMentions: cungRequiredMentions(page.cung),
      };
    case ContentKind.ThuatNgu:
      return {
        factLines: termBriefLines(page),
        mustCover: [],
        requiredMentions: termRequiredMentions(page),
      };
  }
}

export function buildPageBrief(page: PlannedPage): PageBrief {
  const selfRef = plannedRefOf(page);
  const content = contentOf(page);
  const neighbours =
    page.kind === ContentKind.Bai ? neighboursOf(page) : { previous: null, next: null };
  return {
    page,
    limits: limitsFor(page),
    factLines: content.factLines,
    mustCover: content.mustCover,
    requiredMentions: content.requiredMentions,
    linkTargets: allPlannedPages()
      .filter((candidate) => plannedRefOf(candidate) !== selfRef)
      .map(linkTargetOf),
    ownedElsewhere: ownedElsewhere(selfRef),
    previous: neighbours.previous,
    next: neighbours.next,
    teachingLesson: page.kind === ContentKind.Bai ? null : teachingLessonOf(page.learnInLesson),
  };
}
