import type { NguHanh } from '@org/shared-tu-vi';
import { saoFacts } from '@org/shared-kien-thuc';
import { splitClauses } from '../../text/clauses';
import { starsIn } from './clause-mentions';
import {
  bindStar,
  checkedClaim,
  NO_STAR_REASON,
  skippedClaim,
  type ClaimClause,
  type FactCheck,
  type FactCheckResult,
  type FactSubject,
} from './fact-subject';

const HANH_CLAIM = /hành (Kim|Mộc|Thủy|Hỏa|Thổ)(?!\p{L})/gu;
const MANY_HANH_REASON = 'nhiều hành';

export const checkHanh: FactCheck = (plainText: string, subject: FactSubject): FactCheckResult => {
  const violations: string[] = [];
  const claims: ClaimClause[] = [];
  for (const clause of splitClauses(plainText)) {
    const claimed = [...clause.normalize('NFC').matchAll(HANH_CLAIM)].map(
      (match) => match[1] as NguHanh,
    );
    if (claimed.length === 0) continue;
    const distinct = [...new Set(claimed)];
    if (distinct.length >= 2) {
      claims.push(skippedClaim(clause, MANY_HANH_REASON));
      continue;
    }
    const binding = bindStar(
      starsIn(clause).map((hit) => hit.name),
      subject,
    );
    if (binding.kind === 'skip') {
      claims.push(skippedClaim(clause, binding.reason));
      continue;
    }
    if (binding.kind === 'none') {
      claims.push(skippedClaim(clause, NO_STAR_REASON));
      continue;
    }
    const { hanh } = saoFacts(binding.star);
    if (hanh !== distinct[0]) {
      violations.push(`${binding.star} thuộc hành ${hanh}, không phải ${distinct[0]}`);
    }
    claims.push(checkedClaim(clause));
  }
  return { violations, claims };
};
