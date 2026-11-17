import {
  anTuHoa,
  CAN,
  CHINH_TINH_NAMES,
  HOA_NAMES,
  PHU_TINH_NAMES,
  type SaoName,
} from '@org/shared-tu-vi';
import { splitClauses } from '../../text/clauses';
import { findNames, type NameHit } from '../../text/find-names';
import {
  checkedClaim,
  type ClaimClause,
  type FactCheck,
  type FactCheckResult,
} from './fact-subject';

type CanName = (typeof CAN)[number];

const HOA_SET: ReadonlySet<string> = new Set(HOA_NAMES);
const CAN_SET: ReadonlySet<string> = new Set(CAN);
const ALL_STARS: readonly SaoName[] = [...CHINH_TINH_NAMES, ...PHU_TINH_NAMES];
const NON_HOA_STARS: readonly SaoName[] = ALL_STARS.filter((name) => !HOA_SET.has(name));
const CAN_OR_STAR_NAMES: readonly (CanName | SaoName)[] = [...CAN, ...ALL_STARS];

function isCanHit(hit: NameHit<CanName | SaoName>): hit is NameHit<CanName> {
  return CAN_SET.has(hit.name);
}

function cansIn(clause: string): readonly NameHit<CanName>[] {
  return findNames(clause, CAN_OR_STAR_NAMES).filter(isCanHit);
}

export const checkTuHoaByCan: FactCheck = (plainText: string): FactCheckResult => {
  const violations: string[] = [];
  const claims: ClaimClause[] = [];
  for (const clause of splitClauses(plainText)) {
    const cans = cansIn(clause);
    const hoaHits = findNames(clause, HOA_NAMES);
    if (cans.length === 0 || hoaHits.length === 0) continue;
    const can = cans[0].name;
    const table = anTuHoa(CAN.indexOf(can));
    const starHits = findNames(clause, NON_HOA_STARS);
    for (const hoaHit of hoaHits) {
      const before = starHits.filter((hit) => hit.index < hoaHit.index).pop();
      const after = starHits.find((hit) => hit.index > hoaHit.index);
      const bound = before ?? after;
      if (bound === undefined) continue;
      const expected = table.find((row) => row.hoa === hoaHit.name)?.star;
      if (expected !== undefined && bound.name !== expected) {
        violations.push(`Năm ${can}, ${hoaHit.name} là ${expected}, không phải ${bound.name}`);
      }
    }
    claims.push(checkedClaim(clause));
  }
  return { violations, claims };
};
