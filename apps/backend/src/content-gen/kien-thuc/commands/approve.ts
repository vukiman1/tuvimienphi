import { rm } from 'node:fs/promises';
import { ContentKind, type EntryFile, type LessonFile, type PageRef } from '@org/shared-contracts';
import { plannedPage, type PlannedPage } from '@org/shared-kien-thuc';
import { buildPageBrief } from '../brief/build-page-brief';
import { MalformedDraftError, MissingDraftError, UnknownPageRefError } from '../errors';
import { readContent, writeContentPage, writeIndexes } from '../store/content-store';
import { listDraftRefs, readDraft, type StoredDraft } from '../store/draft-store';
import type { DraftFile } from '../store/draft-file';
import { draftPath, type KienThucDirectories } from '../store/kien-thuc-paths';
import { countSyllables, readingMinutes } from '../text/syllable-count';
import type { CorpusPage } from '../validate/check-similarity';
import { validatePage } from '../validate/validate-page';
import { corpusOf } from './corpus';
import { reviewedAtOf } from './reviewed-at';

export interface ApproveRejection {
  readonly ref: PageRef;
  readonly violations: readonly string[];
}

export interface ApproveResult {
  readonly approved: readonly PageRef[];
  readonly rejected: readonly ApproveRejection[];
}

interface RequestedPage {
  readonly ref: PageRef;
  readonly page: PlannedPage;
}

type RequestedDraft =
  | {
      readonly kind: 'read';
      readonly ref: PageRef;
      readonly page: PlannedPage;
      readonly draft: DraftFile;
    }
  | { readonly kind: 'unreadable'; readonly ref: PageRef; readonly message: string };

interface Approval {
  readonly ref: PageRef;
  readonly file: LessonFile | EntryFile;
}

function buildFile(
  page: PlannedPage,
  draft: DraftFile,
  reviewedAt: string,
): LessonFile | EntryFile {
  if (page.kind === ContentKind.Bai) {
    const prose = draft.sections
      .flatMap((section) => [section.heading, ...section.paragraphs])
      .join(' ');
    return {
      slug: page.slug,
      step: page.step,
      order: page.order,
      title: page.title,
      summary: draft.summary,
      sections: draft.sections,
      readingMinutes: readingMinutes(countSyllables(prose)),
      reviewedAt,
    };
  }
  return {
    kind: page.kind,
    group: page.group,
    slug: page.slug,
    title: page.title,
    aliases: page.aliases,
    summary: draft.summary,
    sections: draft.sections,
    learnInLesson: page.learnInLesson,
    reviewedAt,
  };
}

function requestedPages(refs: readonly PageRef[]): readonly RequestedPage[] {
  return refs.map((ref) => {
    const page = plannedPage(ref);
    if (page === undefined) throw new UnknownPageRefError(ref);
    return { ref, page };
  });
}

async function readRequestedDraft(
  requested: RequestedPage,
  directories: KienThucDirectories,
): Promise<RequestedDraft> {
  try {
    const draft = await readDraft(directories, requested.ref);
    return { kind: 'read', ref: requested.ref, page: requested.page, draft };
  } catch (error) {
    if (error instanceof MissingDraftError || error instanceof MalformedDraftError) {
      return { kind: 'unreadable', ref: requested.ref, message: error.message };
    }
    throw error;
  }
}

async function readOtherDrafts(
  directories: KienThucDirectories,
  requested: ReadonlySet<PageRef>,
): Promise<readonly StoredDraft[]> {
  const others: StoredDraft[] = [];
  for (const ref of await listDraftRefs(directories)) {
    if (requested.has(ref)) continue;
    others.push({ ref, draft: await readDraft(directories, ref) });
  }
  return others;
}

interface Verdicts {
  readonly approvals: readonly Approval[];
  readonly rejected: readonly ApproveRejection[];
}

function judge(
  drafts: readonly RequestedDraft[],
  corpus: readonly CorpusPage[],
  reviewedAt: string,
): Verdicts {
  const approvals: Approval[] = [];
  const rejected: ApproveRejection[] = [];
  for (const item of drafts) {
    if (item.kind === 'unreadable') {
      rejected.push({ ref: item.ref, violations: [item.message] });
      continue;
    }
    const validation = validatePage(item.draft, {
      page: item.page,
      requiredMentions: buildPageBrief(item.page).requiredMentions,
      corpus,
    });
    if (validation.violations.length > 0) {
      rejected.push({ ref: item.ref, violations: validation.violations });
      continue;
    }
    approvals.push({ ref: item.ref, file: buildFile(item.page, item.draft, reviewedAt) });
  }
  return { approvals, rejected };
}

export async function approvePages(
  refs: readonly PageRef[],
  directories: KienThucDirectories,
  now: Date,
): Promise<ApproveResult> {
  const pages = requestedPages(refs);
  const content = await readContent(directories.content);
  const drafts: RequestedDraft[] = [];
  for (const requested of pages) drafts.push(await readRequestedDraft(requested, directories));
  const readable = drafts.flatMap((item): readonly StoredDraft[] =>
    item.kind === 'read' ? [{ ref: item.ref, draft: item.draft }] : [],
  );
  const others = await readOtherDrafts(directories, new Set(refs));
  const corpus = corpusOf(content, [...readable, ...others]);
  const { approvals, rejected } = judge(drafts, corpus, reviewedAtOf(now));

  for (const approval of approvals) {
    await writeContentPage(directories.content, approval.file);
    await rm(draftPath(directories, approval.ref), { force: true });
  }
  await writeIndexes(directories.content, await readContent(directories.content));
  return { approved: approvals.map((approval) => approval.ref), rejected };
}
