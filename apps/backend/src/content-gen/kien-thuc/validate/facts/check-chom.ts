import { ContentKind } from '@org/shared-contracts';
import {
  ChinhTinhChom,
  chomMembers,
  CHINH_TINH_NAMES,
  type ChinhTinhName,
} from '@org/shared-tu-vi';
import { isAffirmedAt, normalize } from '../../../check-text';
import { splitClauses } from '../../text/clauses';
import { maskNegationInNames } from '../../text/mask-negation-in-names';
import { starsIn } from './clause-mentions';
import {
  checkedClaim,
  skippedClaim,
  type ClaimClause,
  type FactCheck,
  type FactCheckResult,
  type FactSubject,
} from './fact-subject';

const CHOM_CLAIM = /(?<!\p{L})chòm (tử vi|thiên phủ)(?!\p{L})/gu;
const TWO_CHOM_REASON = 'hai chòm';
const NEGATED_REASON = 'phủ định';
const NO_CHINH_TINH_REASON = 'không có chính tinh';
const OTHER_STAR_REASON = 'nói về sao khác';
const OTHER_STAR_REFERENCE =
  /(?<!\p{L})sao (?:đi cùng|kia|còn lại|khác|bên cạnh|đứng cạnh)(?!\p{L})/u;

const CHINH_TINH_SET: ReadonlySet<string> = new Set(CHINH_TINH_NAMES);

function chomOf(label: string): ChinhTinhChom {
  return label === 'tử vi' ? ChinhTinhChom.TuVi : ChinhTinhChom.ThienPhu;
}

function isChinhTinh(name: string): name is ChinhTinhName {
  return CHINH_TINH_SET.has(name);
}

export const checkChom: FactCheck = (plainText: string, subject: FactSubject): FactCheckResult => {
  const violations: string[] = [];
  const claims: ClaimClause[] = [];
  for (const clause of splitClauses(plainText)) {
    const normalized = maskNegationInNames(normalize(clause));
    const matches = [...normalized.matchAll(CHOM_CLAIM)];
    if (matches.length === 0) continue;
    if (new Set(matches.map((match) => match[1])).size >= 2) {
      claims.push(skippedClaim(clause, TWO_CHOM_REASON));
      continue;
    }
    const first = matches[0];
    if (first.index === undefined || !isAffirmedAt(normalized, first.index)) {
      claims.push(skippedClaim(clause, NEGATED_REASON));
      continue;
    }
    const chom = chomOf(first[1]);
    const members: ReadonlySet<ChinhTinhName> = new Set(chomMembers(chom));
    const named = starsIn(clause)
      .map((hit) => hit.name)
      .filter(isChinhTinh);
    if (named.length === 0) {
      if (OTHER_STAR_REFERENCE.test(normalized)) {
        claims.push(skippedClaim(clause, OTHER_STAR_REASON));
        continue;
      }
      if (subject !== null && subject.kind === ContentKind.Sao && isChinhTinh(subject.star)) {
        if (!members.has(subject.star)) {
          violations.push(`${subject.star} không thuộc chòm ${chom}`);
        }
        claims.push(checkedClaim(clause));
      } else {
        claims.push(skippedClaim(clause, NO_CHINH_TINH_REASON));
      }
      continue;
    }
    for (const star of named) {
      if (!members.has(star)) violations.push(`${star} không thuộc chòm ${chom}`);
    }
    claims.push(checkedClaim(clause));
  }
  return { violations, claims };
};
