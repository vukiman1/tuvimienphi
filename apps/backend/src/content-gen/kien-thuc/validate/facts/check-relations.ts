import { ContentKind } from '@org/shared-contracts';
import { CHI, CUNG_NAMES, nhiHopIndex, tamHopIndexes, xungChieuIndex } from '@org/shared-tu-vi';
import { normalize } from '../../../check-text';
import { splitClauses } from '../../text/clauses';
import { findNames } from '../../text/find-names';
import { chisIn } from './clause-mentions';
import {
  checkedClaim,
  skippedClaim,
  type ClaimClause,
  type FactCheck,
  type FactCheckResult,
  type FactSubject,
} from './fact-subject';

enum Relation {
  Xung = 'xung',
  TamHop = 'tam hợp',
  NhiHop = 'nhị hợp',
}

const RELATION_WORDS: Readonly<Record<Relation, readonly string[]>> = {
  [Relation.Xung]: ['đối cung', 'xung chiếu', 'lục xung', 'tương xung'],
  [Relation.TamHop]: ['tam hợp'],
  [Relation.NhiHop]: ['lục hợp', 'nhị hợp'],
};

const MIXED_REASON = 'nhiều quan hệ';
const COUNT_REASON = 'không đúng số cung/chi';

interface Participants {
  readonly names: readonly string[];
  readonly order: readonly string[];
}

function relationsPresent(normalized: string): readonly Relation[] {
  return (Object.keys(RELATION_WORDS) as Relation[]).filter((relation) =>
    RELATION_WORDS[relation].some((word) => normalized.includes(word)),
  );
}

function sharesTamHop(order: readonly string[], names: readonly string[]): boolean {
  const indexes = names.map((name) => order.indexOf(name));
  return indexes.every((index, i) =>
    indexes.every((other, j) => i === j || tamHopIndexes(index).includes(other)),
  );
}

function isXungPair(order: readonly string[], names: readonly string[]): boolean {
  return xungChieuIndex(order.indexOf(names[0])) === order.indexOf(names[1]);
}

function isNhiHopPair(names: readonly string[]): boolean {
  return (
    nhiHopIndex((CHI as readonly string[]).indexOf(names[0])) ===
    (CHI as readonly string[]).indexOf(names[1])
  );
}

export const checkRelations: FactCheck = (
  plainText: string,
  subject: FactSubject,
): FactCheckResult => {
  const violations: string[] = [];
  const claims: ClaimClause[] = [];
  const subjectCung = subject !== null && subject.kind === ContentKind.Cung ? subject.cung : null;
  for (const clause of splitClauses(plainText)) {
    const present = relationsPresent(normalize(clause));
    if (present.length === 0) continue;
    if (present.length >= 2) {
      claims.push(skippedClaim(clause, MIXED_REASON));
      continue;
    }
    const relation = present[0];
    const palaces = findNames(clause, CUNG_NAMES).map((hit) => hit.name);
    const chis = chisIn(clause).map((hit) => hit.name);
    const cung: Participants | null =
      palaces.length > 0
        ? {
            names:
              subjectCung !== null && !palaces.includes(subjectCung)
                ? [subjectCung, ...palaces]
                : palaces,
            order: CUNG_NAMES,
          }
        : null;
    const chi: Participants = { names: chis, order: CHI as readonly string[] };

    if (relation === Relation.NhiHop) {
      if (chi.names.length !== 2) {
        claims.push(skippedClaim(clause, COUNT_REASON));
        continue;
      }
      if (!isNhiHopPair(chi.names)) {
        violations.push(`${chi.names[0]} không nhị hợp với ${chi.names[1]}`);
      }
      claims.push(checkedClaim(clause));
      continue;
    }

    const target = cung ?? (chi.names.length > 0 ? chi : null);
    if (target === null) {
      claims.push(skippedClaim(clause, COUNT_REASON));
      continue;
    }

    if (relation === Relation.Xung) {
      if (target.names.length !== 2) {
        claims.push(skippedClaim(clause, COUNT_REASON));
        continue;
      }
      if (!isXungPair(target.order, target.names)) {
        violations.push(`${target.names[0]} không xung chiếu với ${target.names[1]}`);
      }
      claims.push(checkedClaim(clause));
      continue;
    }

    if (target.names.length < 2 || target.names.length > 3) {
      claims.push(skippedClaim(clause, COUNT_REASON));
      continue;
    }
    if (!sharesTamHop(target.order, target.names)) {
      violations.push(`${target.names.join(', ')} không cùng một bộ tam hợp`);
    }
    claims.push(checkedClaim(clause));
  }
  return { violations, claims };
};
