import { ContentKind, pageRef, type PageRef } from '@org/shared-contracts';
import { castSampleChart, plannedPage } from '@org/shared-kien-thuc';
import { readContent } from '../store/content-store';
import type { PageDraftBody } from '../validate/check-shape';
import { checkCatHung } from '../validate/facts/check-cat-hung';
import { checkChom } from '../validate/facts/check-chom';
import { checkHanh } from '../validate/facts/check-hanh';
import { checkRatings } from '../validate/facts/check-ratings';
import { checkRelations } from '../validate/facts/check-relations';
import { checkSampleChart } from '../validate/facts/check-sample-chart';
import { checkTuHoaByCan } from '../validate/facts/check-tu-hoa-by-can';
import { factSubjectOf, type FactCheck } from '../validate/facts/fact-subject';
import { bodyPlainText } from '../validate/validate-page';

const SAMPLE_CHART_LESSON_SLUG = 'doc-la-so-cua-chinh-ban';
const FACT_CHECKS: readonly FactCheck[] = [
  checkRatings,
  checkHanh,
  checkChom,
  checkCatHung,
  checkRelations,
  checkTuHoaByCan,
];

export interface ContentFactViolations {
  readonly ref: PageRef;
  readonly violations: readonly string[];
}

function violationsFor(ref: PageRef, body: PageDraftBody): readonly string[] {
  const page = plannedPage(ref);
  if (page === undefined) return [];
  const plainText = bodyPlainText(body);
  const subject = factSubjectOf(page);
  const violations = FACT_CHECKS.flatMap((check) => check(plainText, subject).violations);
  if (page.kind === ContentKind.Bai && page.slug === SAMPLE_CHART_LESSON_SLUG) {
    violations.push(...checkSampleChart(plainText, castSampleChart()).violations);
  }
  return violations;
}

export async function approvedContentFactViolations(
  directory: string,
): Promise<readonly ContentFactViolations[]> {
  const content = await readContent(directory);
  const found: ContentFactViolations[] = [];
  for (const lesson of content.lessons) {
    const ref = pageRef(ContentKind.Bai, lesson.slug);
    const violations = violationsFor(ref, lesson);
    if (violations.length > 0) found.push({ ref, violations });
  }
  for (const entry of content.entries) {
    const ref = pageRef(entry.kind, entry.slug);
    const violations = violationsFor(ref, entry);
    if (violations.length > 0) found.push({ ref, violations });
  }
  return found;
}
