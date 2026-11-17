import { ContentKind } from '@org/shared-contracts';
import type { CungName, SaoName } from '@org/shared-tu-vi';
import type { PlannedPage } from '@org/shared-kien-thuc';

export type FactSubject =
  | { readonly kind: ContentKind.Sao; readonly star: SaoName }
  | { readonly kind: ContentKind.Cung; readonly cung: CungName }
  | null;

export function factSubjectOf(page: PlannedPage): FactSubject {
  if (page.kind === ContentKind.Sao) return { kind: ContentKind.Sao, star: page.star };
  if (page.kind === ContentKind.Cung) return { kind: ContentKind.Cung, cung: page.cung };
  return null;
}

export enum ClaimStatus {
  Checked = 'checked',
  Skipped = 'skipped',
}

export interface ClaimClause {
  readonly clause: string;
  readonly status: ClaimStatus;
  readonly reason: string | null;
}

export interface FactCheckResult {
  readonly violations: readonly string[];
  readonly claims: readonly ClaimClause[];
}

export type FactCheck = (plainText: string, subject: FactSubject) => FactCheckResult;

export function checkedClaim(clause: string): ClaimClause {
  return { clause, status: ClaimStatus.Checked, reason: null };
}

export function skippedClaim(clause: string, reason: string): ClaimClause {
  return { clause, status: ClaimStatus.Skipped, reason };
}

export const TWO_STARS_REASON = 'hai sao';
export const TOO_MANY_STARS_REASON = 'quá nhiều tên';
export const NO_STAR_REASON = 'không rõ sao nào';

export type StarBinding =
  | { readonly kind: 'star'; readonly star: SaoName }
  | { readonly kind: 'skip'; readonly reason: string }
  | { readonly kind: 'none' };

export function bindStar(stars: readonly SaoName[], subject: FactSubject): StarBinding {
  const distinct = [...new Set(stars)];
  if (distinct.length >= 2) {
    return {
      kind: 'skip',
      reason: distinct.length === 2 ? TWO_STARS_REASON : TOO_MANY_STARS_REASON,
    };
  }
  if (distinct.length === 1) return { kind: 'star', star: distinct[0] };
  if (subject !== null && subject.kind === ContentKind.Sao) {
    return { kind: 'star', star: subject.star };
  }
  return { kind: 'none' };
}
