import { ContentKind, EntryGroup, type ContentSection } from '@org/shared-contracts';
import type { PlannedPage } from '@org/shared-kien-thuc';
import { paragraphCountViolations } from '../../check-text';

export interface PageDraftBody {
  readonly summary: string;
  readonly sections: readonly ContentSection[];
}

export interface PageLimits {
  readonly minSyllables: number;
  readonly maxSyllables: number;
  readonly minSections: number;
  readonly maxSections: number;
  readonly minParagraphs: number;
  readonly maxParagraphs: number;
  readonly minLinkTargets: number;
}

export const LESSON_LIMITS: PageLimits = {
  minSyllables: 600,
  maxSyllables: 1000,
  minSections: 3,
  maxSections: 6,
  minParagraphs: 2,
  maxParagraphs: 4,
  minLinkTargets: 3,
};

export const CORE_ENTRY_LIMITS: PageLimits = {
  minSyllables: 450,
  maxSyllables: 800,
  minSections: 3,
  maxSections: 5,
  minParagraphs: 1,
  maxParagraphs: 3,
  minLinkTargets: 2,
};

export const ENTRY_LIMITS: PageLimits = {
  minSyllables: 300,
  maxSyllables: 700,
  minSections: 3,
  maxSections: 5,
  minParagraphs: 1,
  maxParagraphs: 3,
  minLinkTargets: 2,
};

export function limitsFor(page: PlannedPage): PageLimits {
  if (page.kind === ContentKind.Bai) return LESSON_LIMITS;
  if (page.group === EntryGroup.ChinhTinh || page.group === EntryGroup.Cung) {
    return CORE_ENTRY_LIMITS;
  }
  return ENTRY_LIMITS;
}

export const SUMMARY_MIN_LENGTH = 60;
export const SUMMARY_MAX_LENGTH = 160;
export const HEADING_MAX_LENGTH = 70;

const LINK_MARKUP = /\[\[/u;

export function checkShape(
  body: PageDraftBody,
  title: string,
  limits: PageLimits,
): readonly string[] {
  const violations: string[] = [];
  const sectionCount = body.sections.length;
  if (sectionCount < limits.minSections || sectionCount > limits.maxSections) {
    violations.push(
      `có ${sectionCount} mục, cần từ ${limits.minSections} đến ${limits.maxSections} mục`,
    );
  }
  if (body.summary.length < SUMMARY_MIN_LENGTH || body.summary.length > SUMMARY_MAX_LENGTH) {
    violations.push(
      `tóm tắt có ${body.summary.length} ký tự, cần từ ${SUMMARY_MIN_LENGTH} đến ${SUMMARY_MAX_LENGTH} ký tự`,
    );
  }
  if (LINK_MARKUP.test(body.summary)) {
    violations.push('tóm tắt không được chứa liên kết');
  }
  const headings = new Set<string>();
  for (const section of body.sections) {
    violations.push(
      ...paragraphCountViolations(
        `"${section.heading}"`,
        section.paragraphs,
        limits.minParagraphs,
        limits.maxParagraphs,
      ),
    );
    if (LINK_MARKUP.test(section.heading)) {
      violations.push(`mục "${section.heading}": tiêu đề không được chứa liên kết`);
    }
    if (section.heading.length > HEADING_MAX_LENGTH) {
      violations.push(`tiêu đề "${section.heading}" dài quá ${HEADING_MAX_LENGTH} ký tự`);
    }
    if (section.heading === title) {
      violations.push(`tiêu đề "${section.heading}" trùng tên trang`);
    }
    if (headings.has(section.heading)) {
      violations.push(`tiêu đề "${section.heading}" bị lặp`);
    }
    headings.add(section.heading);
  }
  return violations;
}
