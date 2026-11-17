import { ContentKind } from '@org/shared-contracts';
import type { SaoName } from '@org/shared-tu-vi';
import { saoFacts, SaoKind } from '@org/shared-kien-thuc';
import { splitClauses } from '../../text/clauses';
import { starsIn } from './clause-mentions';
import {
  checkedClaim,
  skippedClaim,
  type ClaimClause,
  type FactCheck,
  type FactCheckResult,
  type FactSubject,
} from './fact-subject';

const CAT_HUNG_TERM = /(?:hung tinh|cát tinh|sao hung|sao cát)/u;
const COPULA_AFTER =
  /^ (?:là|thuộc|được xếp vào)(?: nhóm| một| một trong các)? (hung tinh|cát tinh|sao hung|sao cát)(?!\p{L})/u;
const COPULA_LEADING =
  /(?<!\p{L})(?:là|thuộc|được xếp vào)(?: nhóm| một| một trong các)? (hung tinh|cát tinh|sao hung|sao cát)(?!\p{L})/u;
const NOT_COPULAR_REASON = 'không phải thể khẳng định';
const CHINH_TINH_REASON = 'không xét chính tinh';

interface CatHungClaim {
  readonly star: SaoName;
  readonly claimHung: boolean;
}

function claimOf(clause: string, subject: FactSubject): CatHungClaim | null {
  const text = clause.normalize('NFC');
  const stars = starsIn(clause);
  for (const hit of stars) {
    const match = COPULA_AFTER.exec(text.slice(hit.index + hit.name.length));
    if (match) return { star: hit.name, claimHung: match[1].includes('hung') };
  }
  if (stars.length === 0 && subject !== null && subject.kind === ContentKind.Sao) {
    const match = COPULA_LEADING.exec(text);
    if (match) return { star: subject.star, claimHung: match[1].includes('hung') };
  }
  return null;
}

export const checkCatHung: FactCheck = (
  plainText: string,
  subject: FactSubject,
): FactCheckResult => {
  const violations: string[] = [];
  const claims: ClaimClause[] = [];
  for (const clause of splitClauses(plainText)) {
    if (!CAT_HUNG_TERM.test(clause.normalize('NFC'))) continue;
    const claim = claimOf(clause, subject);
    if (claim === null) {
      claims.push(skippedClaim(clause, NOT_COPULAR_REASON));
      continue;
    }
    const facts = saoFacts(claim.star);
    if (facts.kind === SaoKind.ChinhTinh) {
      claims.push(skippedClaim(clause, CHINH_TINH_REASON));
      continue;
    }
    if (facts.isHung !== claim.claimHung) {
      violations.push(
        `${claim.star} ${facts.isHung ? 'là hung tinh' : 'là cát tinh'}, không phải ${claim.claimHung ? 'hung tinh' : 'cát tinh'}`,
      );
    }
    claims.push(checkedClaim(clause));
  }
  return { violations, claims };
};
