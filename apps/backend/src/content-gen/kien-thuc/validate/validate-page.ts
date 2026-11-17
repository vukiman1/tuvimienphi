import { ContentKind, type EntryGroup } from '@org/shared-contracts';
import { castSampleChart, plannedRefOf, type PlannedPage } from '@org/shared-kien-thuc';
import { toPlainText } from '../text/link-markup';
import { checkLength } from './check-length';
import { checkLinks } from './check-links';
import { checkRequiredMentions } from './check-required-mentions';
import { checkShape, limitsFor, type PageDraftBody } from './check-shape';
import { checkSimilarity, similarityWarnings, type CorpusPage } from './check-similarity';
import { checkWording } from './check-wording';
import { claimClausesOf } from './facts/claim-clauses';
import { checkCatHung } from './facts/check-cat-hung';
import { checkChom } from './facts/check-chom';
import { checkHanh } from './facts/check-hanh';
import { checkRatings } from './facts/check-ratings';
import { checkRelations } from './facts/check-relations';
import { checkSampleChart } from './facts/check-sample-chart';
import { checkTuHoaByCan } from './facts/check-tu-hoa-by-can';
import {
  factSubjectOf,
  type ClaimClause,
  type FactCheck,
  type FactCheckResult,
} from './facts/fact-subject';

const SAMPLE_CHART_LESSON_SLUG = 'doc-la-so-cua-chinh-ban';
const FACT_CHECKS: readonly FactCheck[] = [
  checkRatings,
  checkHanh,
  checkChom,
  checkCatHung,
  checkRelations,
  checkTuHoaByCan,
];

export interface PageValidationContext {
  readonly page: PlannedPage;
  readonly requiredMentions: readonly string[];
  readonly corpus: readonly CorpusPage[];
}

export interface PageValidation {
  readonly violations: readonly string[];
  readonly claims: readonly ClaimClause[];
  readonly warnings: readonly string[];
}

export function bodyPlainText(body: PageDraftBody): string {
  return [
    body.summary,
    ...body.sections.flatMap((section) => [section.heading, ...section.paragraphs]),
  ]
    .map(toPlainText)
    .join('\n');
}

function groupOf(page: PlannedPage): EntryGroup | null {
  return page.kind === ContentKind.Bai ? null : page.group;
}

export function validatePage(body: PageDraftBody, context: PageValidationContext): PageValidation {
  const { page, requiredMentions, corpus } = context;
  const self = plannedRefOf(page);
  const limits = limitsFor(page);
  const plainText = bodyPlainText(body);
  const subject = factSubjectOf(page);

  const violations: string[] = [
    ...checkShape(body, page.title, limits),
    ...checkLength(body, limits),
    ...checkLinks(body, self, limits),
    ...checkWording(body),
    ...checkRequiredMentions(body, requiredMentions),
  ];

  const factResults: FactCheckResult[] = FACT_CHECKS.map((check) => check(plainText, subject));
  if (page.kind === ContentKind.Bai && page.slug === SAMPLE_CHART_LESSON_SLUG) {
    factResults.push(checkSampleChart(plainText, castSampleChart()));
  }
  for (const result of factResults) violations.push(...result.violations);

  const corpusPage: CorpusPage = { ref: self, group: groupOf(page), plainText };
  violations.push(...checkSimilarity(corpusPage, corpus));

  return {
    violations,
    claims: claimClausesOf(plainText, factResults),
    warnings: similarityWarnings(corpusPage, corpus),
  };
}
