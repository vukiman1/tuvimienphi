import { ContentKind, pageRef, type PageRef } from '@org/shared-contracts';
import { plannedPage } from '@org/shared-kien-thuc';
import { readContent } from '../store/content-store';
import type { PageDraftBody } from '../validate/check-shape';
import { factViolations, UNPLANNED_PAGE_VIOLATION } from '../validate/validate-page';

export interface ContentFactViolations {
  readonly ref: PageRef;
  readonly violations: readonly string[];
}

function violationsFor(ref: PageRef, body: PageDraftBody): readonly string[] {
  const page = plannedPage(ref);
  if (page === undefined) return [UNPLANNED_PAGE_VIOLATION];
  return factViolations(page, body);
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
