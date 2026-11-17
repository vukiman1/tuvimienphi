import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  ContentKind,
  KIEN_THUC_MANIFEST_FILE,
  KIEN_THUC_SEARCH_INDEX_FILE,
  pageRef,
  parsePageRef,
  type PageRef,
} from '@org/shared-contracts';
import { plannedPage } from '@org/shared-kien-thuc';
import { buildPageBrief } from '../brief/build-page-brief';
import { UnknownPageRefError } from '../errors';
import { buildManifest } from '../indexes/build-manifest';
import { buildSearchIndex } from '../indexes/build-search-index';
import { readContent, type ContentFiles } from '../store/content-store';
import { draftExists, readAllDrafts, readDraft } from '../store/draft-store';
import type { KienThucDirectories } from '../store/kien-thuc-paths';
import type { PageDraftBody } from '../validate/check-shape';
import {
  closestNeighbour,
  findTooSimilarPages,
  type Neighbour,
} from '../validate/check-similarity';
import { ClaimStatus } from '../validate/facts/fact-subject';
import { bodyPlainText, validatePage, type PageValidation } from '../validate/validate-page';
import { buildCorpus } from './corpus';

export enum CheckedSource {
  Draft = 'draft',
  Content = 'content',
}

export interface PageCheck {
  readonly ref: PageRef;
  readonly source: CheckedSource;
  readonly validation: PageValidation;
  readonly neighbour: Neighbour | null;
}

export interface PlanDrift {
  readonly ref: PageRef;
  readonly fields: readonly string[];
}

export interface ContentCheckReport {
  readonly pages: readonly PageCheck[];
  readonly similarPairs: ReturnType<typeof findTooSimilarPages>;
  readonly planDrift: readonly PlanDrift[];
  readonly staleIndexes: readonly string[];
}

async function bodyOf(
  directories: KienThucDirectories,
  ref: PageRef,
  hasDraft: boolean,
): Promise<PageDraftBody> {
  if (hasDraft) return readDraft(directories, ref);
  const content = await readContent(directories.content);
  const parsed = parsePageRef(ref);
  if (parsed?.kind === ContentKind.Bai) {
    const lesson = content.lessons.find((item) => item.slug === parsed.slug);
    if (lesson !== undefined) return lesson;
  }
  const entry = content.entries.find((item) => pageRef(item.kind, item.slug) === ref);
  if (entry !== undefined) return entry;
  throw new UnknownPageRefError(ref);
}

export async function checkOnePage(
  ref: PageRef,
  directories: KienThucDirectories,
): Promise<PageCheck> {
  const page = plannedPage(ref);
  if (page === undefined) throw new UnknownPageRefError(ref);
  const hasDraft = draftExists(directories, ref);
  const body = await bodyOf(directories, ref, hasDraft);
  const corpus = await buildCorpus(directories, ref);
  const validation = validatePage(body, {
    page,
    requiredMentions: buildPageBrief(page).requiredMentions,
    corpus,
  });
  return {
    ref,
    source: hasDraft ? CheckedSource.Draft : CheckedSource.Content,
    validation,
    neighbour: closestNeighbour(ref, bodyPlainText(body), corpus),
  };
}

export function renderPageCheck(check: PageCheck): string {
  const lines = [`# ${check.ref} (${check.source})`];
  if (check.validation.violations.length > 0) {
    lines.push('## Vi phạm', ...check.validation.violations.map((v) => `- ${v}`));
  }
  if (check.neighbour !== null) {
    lines.push(`Gần nhất: ${check.neighbour.ref} (${check.neighbour.score.toFixed(2)})`);
  }
  if (check.validation.warnings.length > 0) {
    lines.push('## Cảnh báo', ...check.validation.warnings.map((w) => `- ${w}`));
  }
  lines.push(
    '## Mệnh đề',
    ...check.validation.claims.map((claim) => {
      const status = claim.status === ClaimStatus.Skipped ? 'bỏ qua' : 'đã soát';
      const reason = claim.reason === null ? '' : ` (${claim.reason})`;
      return `- [${status}] ${claim.clause}${reason}`;
    }),
  );
  return lines.join('\n');
}

const PLAN_LESSON_FIELDS = ['title', 'step', 'order'] as const;
const PLAN_ENTRY_FIELDS = ['title', 'kind', 'group', 'aliases', 'learnInLesson'] as const;

function driftOf(content: ContentFiles): readonly PlanDrift[] {
  const drift: PlanDrift[] = [];
  for (const lesson of content.lessons) {
    const planned = plannedPage(pageRef(ContentKind.Bai, lesson.slug));
    if (planned === undefined || planned.kind !== ContentKind.Bai) continue;
    const fields = PLAN_LESSON_FIELDS.filter((field) => lesson[field] !== planned[field]);
    if (fields.length > 0) drift.push({ ref: pageRef(ContentKind.Bai, lesson.slug), fields });
  }
  for (const entry of content.entries) {
    const ref = pageRef(entry.kind, entry.slug);
    const planned = plannedPage(ref);
    if (planned === undefined || planned.kind === ContentKind.Bai) continue;
    const fields = PLAN_ENTRY_FIELDS.filter(
      (field) => JSON.stringify(entry[field]) !== JSON.stringify(planned[field]),
    );
    if (fields.length > 0) drift.push({ ref, fields });
  }
  return drift;
}

async function readJsonFile(path: string): Promise<unknown> {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return null;
  }
}

function isStaleIndex(onDisk: unknown, rebuilt: unknown, hasContent: boolean): boolean {
  if (onDisk === null) return hasContent;
  return JSON.stringify(onDisk) !== JSON.stringify(rebuilt);
}

async function staleIndexesOf(
  directories: KienThucDirectories,
  content: ContentFiles,
): Promise<readonly string[]> {
  const hasContent = content.lessons.length > 0 || content.entries.length > 0;
  const stale: string[] = [];
  const manifest = await readJsonFile(join(directories.content, KIEN_THUC_MANIFEST_FILE));
  if (isStaleIndex(manifest, buildManifest(content), hasContent)) {
    stale.push(KIEN_THUC_MANIFEST_FILE);
  }
  const index = await readJsonFile(join(directories.content, KIEN_THUC_SEARCH_INDEX_FILE));
  if (isStaleIndex(index, buildSearchIndex(content), hasContent)) {
    stale.push(KIEN_THUC_SEARCH_INDEX_FILE);
  }
  return stale;
}

export async function checkKienThucContent(
  directories: KienThucDirectories,
): Promise<ContentCheckReport> {
  const content = await readContent(directories.content);
  const drafts = await readAllDrafts(directories);
  const refs = new Set<PageRef>([
    ...content.lessons.map((lesson) => pageRef(ContentKind.Bai, lesson.slug)),
    ...content.entries.map((entry) => pageRef(entry.kind, entry.slug)),
    ...drafts.map((stored) => stored.ref),
  ]);
  const pages: PageCheck[] = [];
  for (const ref of refs) pages.push(await checkOnePage(ref, directories));
  return {
    pages,
    similarPairs: findTooSimilarPages(await buildCorpus(directories)),
    planDrift: driftOf(content),
    staleIndexes: await staleIndexesOf(directories, content),
  };
}
