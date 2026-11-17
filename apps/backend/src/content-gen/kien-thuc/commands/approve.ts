import { rm } from 'node:fs/promises';
import {
  ContentKind,
  pageRef,
  type EntryFile,
  type EntryGroup,
  type LessonFile,
  type PageRef,
} from '@org/shared-contracts';
import { plannedPage, type PlannedPage } from '@org/shared-kien-thuc';
import { buildPageBrief } from '../brief/build-page-brief';
import { MalformedDraftError, MissingDraftError, UnknownPageRefError } from '../errors';
import { readContent, writeContentPage, writeIndexes } from '../store/content-store';
import { readAllDrafts, readDraft } from '../store/draft-store';
import type { DraftFile } from '../store/draft-file';
import { draftPath, type KienThucDirectories } from '../store/kien-thuc-paths';
import { countSyllables, readingMinutes } from '../text/syllable-count';
import type { CorpusPage } from '../validate/check-similarity';
import { bodyPlainText, validatePage } from '../validate/validate-page';
import { reviewedAtOf } from './reviewed-at';

export interface ApproveRejection {
  readonly ref: PageRef;
  readonly violations: readonly string[];
}

export interface ApproveResult {
  readonly approved: readonly PageRef[];
  readonly rejected: readonly ApproveRejection[];
}

function groupOf(page: PlannedPage): EntryGroup | null {
  return page.kind === ContentKind.Bai ? null : page.group;
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

async function buildCorpus(
  directories: KienThucDirectories,
  exclude: PageRef,
): Promise<readonly CorpusPage[]> {
  const content = await readContent(directories.content);
  const drafts = await readAllDrafts(directories);
  const pages: CorpusPage[] = [];
  for (const lesson of content.lessons) {
    pages.push({
      ref: pageRef(ContentKind.Bai, lesson.slug),
      group: null,
      plainText: bodyPlainText(lesson),
    });
  }
  for (const entry of content.entries) {
    pages.push({
      ref: pageRef(entry.kind, entry.slug),
      group: entry.group,
      plainText: bodyPlainText(entry),
    });
  }
  for (const stored of drafts) {
    const page = plannedPage(stored.ref);
    pages.push({
      ref: stored.ref,
      group: page === undefined ? null : groupOf(page),
      plainText: bodyPlainText(stored.draft),
    });
  }
  return pages.filter((page) => page.ref !== exclude);
}

export async function approvePages(
  refs: readonly PageRef[],
  directories: KienThucDirectories,
  now: Date,
): Promise<ApproveResult> {
  const approved: PageRef[] = [];
  const rejected: ApproveRejection[] = [];
  for (const ref of refs) {
    const page = plannedPage(ref);
    if (page === undefined) throw new UnknownPageRefError(ref);
    let draft: DraftFile;
    try {
      draft = await readDraft(directories, ref);
    } catch (error) {
      if (error instanceof MissingDraftError || error instanceof MalformedDraftError) {
        rejected.push({ ref, violations: [error.message] });
        continue;
      }
      throw error;
    }
    const corpus = await buildCorpus(directories, ref);
    const validation = validatePage(draft, {
      page,
      requiredMentions: buildPageBrief(page).requiredMentions,
      corpus,
    });
    if (validation.violations.length > 0) {
      rejected.push({ ref, violations: validation.violations });
      continue;
    }
    await writeContentPage(directories.content, buildFile(page, draft, reviewedAtOf(now)));
    await rm(draftPath(directories, ref), { force: true });
    approved.push(ref);
  }
  await writeIndexes(directories.content, await readContent(directories.content));
  return { approved, rejected };
}
