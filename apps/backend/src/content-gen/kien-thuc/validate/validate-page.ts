import { castSampleChart, plannedRefOf, type PlannedPage } from '@org/shared-kien-thuc';
import { toPlainText } from '../text/link-markup';
import { checkLength } from './check-length';
import { checkLinks } from './check-links';
import { checkRequiredMentions } from './check-required-mentions';
import { checkShape, limitsFor, type PageDraftBody } from './check-shape';
import { checkSimilarity, groupOf, similarityWarnings, type CorpusPage } from './check-similarity';
import { checkWording } from './check-wording';
import { claimClausesOf } from './facts/claim-clauses';
import { checkCatHung } from './facts/check-cat-hung';
import { checkChom } from './facts/check-chom';
import { checkHanh } from './facts/check-hanh';
import { checkRatings } from './facts/check-ratings';
import { checkRelations } from './facts/check-relations';
import { checkSampleChart, isSampleChartLesson } from './facts/check-sample-chart';
import { checkTuHoaByCan } from './facts/check-tu-hoa-by-can';
import {
  factSubjectOf,
  type ClaimClause,
  type FactCheck,
  type FactCheckResult,
} from './facts/fact-subject';

const FACT_CHECKS: readonly FactCheck[] = [
  checkRatings,
  checkHanh,
  checkChom,
  checkCatHung,
  checkRelations,
  checkTuHoaByCan,
];

export const UNPLANNED_PAGE_VIOLATION = 'không có trong danh mục';

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

function factCheckResults(page: PlannedPage, plainText: string): readonly FactCheckResult[] {
  const subject = factSubjectOf(page);
  const results = FACT_CHECKS.map((check) => check(plainText, subject));
  return isSampleChartLesson(page)
    ? [...results, checkSampleChart(plainText, castSampleChart())]
    : results;
}

export function factViolations(page: PlannedPage, body: PageDraftBody): readonly string[] {
  return factCheckResults(page, bodyPlainText(body)).flatMap((result) => result.violations);
}

export function validatePage(body: PageDraftBody, context: PageValidationContext): PageValidation {
  const { page, requiredMentions, corpus } = context;
  const self = plannedRefOf(page);
  const limits = limitsFor(page);
  const plainText = bodyPlainText(body);

  const violations: string[] = [
    ...checkShape(body, page.title, limits),
    ...checkLength(body, limits),
    ...checkLinks(body, self, limits),
    ...checkWording(body),
    ...checkRequiredMentions(body, requiredMentions),
  ];

  const factResults = factCheckResults(page, plainText);
  for (const result of factResults) violations.push(...result.violations);

  const corpusPage: CorpusPage = { ref: self, group: groupOf(page), plainText };
  violations.push(...checkSimilarity(corpusPage, corpus));

  return {
    violations,
    claims: claimClausesOf(plainText, factResults),
    warnings: similarityWarnings(corpusPage, corpus),
  };
}
