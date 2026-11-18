import { normalize } from '../../../check-text';
import { splitClauses } from '../../text/clauses';
import { ClaimStatus, skippedClaim, type ClaimClause, type FactCheckResult } from './fact-subject';

const RATING_WORDS = ['miếu', 'vượng', 'đắc địa', 'bình hòa', 'hãm'];
const RELATION_WORDS = [
  'đối cung',
  'xung chiếu',
  'lục xung',
  'tương xung',
  'tam hợp',
  'lục hợp',
  'nhị hợp',
];
const CAT_HUNG_WORDS = ['hung tinh', 'cát tinh', 'sao hung', 'sao cát'];

export const CLAIM_WORDS: readonly string[] = [
  ...RATING_WORDS,
  'hành',
  'chòm',
  ...CAT_HUNG_WORDS,
  ...RELATION_WORDS,
  'luôn',
  'không bao giờ',
  'bệnh',
  'sức khỏe',
  'tiền',
  'tài sản',
];

const NO_CHECKER_REASON = 'không checker nào đọc mệnh đề này';

export function claimClausesOf(
  plainText: string,
  results: readonly FactCheckResult[],
): readonly ClaimClause[] {
  const reported = new Map<string, readonly ClaimClause[]>();
  for (const result of results) {
    for (const claim of result.claims) {
      reported.set(claim.clause, [...(reported.get(claim.clause) ?? []), claim]);
    }
  }
  const listed: ClaimClause[] = [];
  const seen = new Set<string>();
  for (const clause of splitClauses(plainText)) {
    if (seen.has(clause)) continue;
    const normalized = normalize(clause);
    if (!reported.has(clause) && !CLAIM_WORDS.some((word) => normalized.includes(word))) continue;
    seen.add(clause);
    const claims = reported.get(clause) ?? [];
    const checked = claims.find((claim) => claim.status === ClaimStatus.Checked);
    if (checked !== undefined) {
      listed.push(checked);
      continue;
    }
    listed.push(
      claims.find((claim) => claim.status === ClaimStatus.Skipped) ??
        skippedClaim(clause, NO_CHECKER_REASON),
    );
  }
  return [
    ...listed.filter((claim) => claim.status === ClaimStatus.Skipped),
    ...listed.filter((claim) => claim.status === ClaimStatus.Checked),
  ];
}
