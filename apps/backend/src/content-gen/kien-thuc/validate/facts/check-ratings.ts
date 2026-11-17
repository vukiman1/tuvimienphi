import { CHI, type Rating } from '@org/shared-tu-vi';
import { ratingAt, saoFacts } from '@org/shared-kien-thuc';
import { isAffirmedAt, normalize } from '../../../check-text';
import { splitClauses } from '../../text/clauses';
import { findNames } from '../../text/find-names';
import { chisIn, starsIn } from './clause-mentions';
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

const RATING_WORD_TO_LETTER: Readonly<Record<string, Rating>> = {
  'đắc địa': 'Đ',
  'bình hòa': 'B',
  miếu: 'M',
  vượng: 'V',
  hãm: 'H',
};
const RATING_WORDS: readonly string[] = Object.keys(RATING_WORD_TO_LETTER);
const RATING_LETTER_TO_WORD: Readonly<Record<Rating, string>> = {
  M: 'miếu',
  V: 'vượng',
  Đ: 'đắc địa',
  B: 'bình hòa',
  H: 'hãm',
};
const SCALE_GAP = /^[\s,/–-]*(?:và|hay|hoặc)?[\s,/–-]*$/u;
const IGNORED_VUONG_BEFORE = /(?:thịnh|hưng) $/u;
const SCALE_NAME_REASON = 'tên thang bậc';
const NEGATED_REASON = 'phủ định';

interface RatingWordHit {
  readonly letter: Rating;
  readonly start: number;
  readonly end: number;
  readonly affirmed: boolean;
}

interface RatingHit extends RatingWordHit {
  readonly scale: boolean;
}

function ratingWordHits(normalizedClause: string): readonly RatingWordHit[] {
  return findNames(normalizedClause, RATING_WORDS)
    .filter((hit) => {
      if (hit.name !== 'vượng') return true;
      return !IGNORED_VUONG_BEFORE.test(normalizedClause.slice(0, hit.index));
    })
    .map((hit) => ({
      letter: RATING_WORD_TO_LETTER[hit.name],
      start: hit.index,
      end: hit.index + hit.name.length,
      affirmed: isAffirmedAt(normalizedClause, hit.index),
    }));
}

function scaleHitIndexes(
  normalizedClause: string,
  hits: readonly RatingWordHit[],
): ReadonlySet<number> {
  const inScale = new Set<number>();
  let runStart = 0;
  for (let i = 1; i <= hits.length; i += 1) {
    const broken =
      i === hits.length || !SCALE_GAP.test(normalizedClause.slice(hits[i - 1].end, hits[i].start));
    if (!broken) continue;
    if (i - runStart >= 2) {
      for (let j = runStart; j < i; j += 1) inScale.add(j);
    }
    runStart = i;
  }
  return inScale;
}

function ratingHits(normalizedClause: string): readonly RatingHit[] {
  const hits = ratingWordHits(normalizedClause);
  const inScale = scaleHitIndexes(normalizedClause, hits);
  return hits.map((hit, index) => ({ ...hit, scale: inScale.has(index) }));
}

export const checkRatings: FactCheck = (
  plainText: string,
  subject: FactSubject,
): FactCheckResult => {
  const violations: string[] = [];
  const claims: ClaimClause[] = [];
  for (const clause of splitClauses(plainText)) {
    const hits = ratingHits(normalize(clause));
    if (hits.length === 0) continue;
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
    const affirmed = new Set(
      hits.filter((hit) => hit.affirmed && !hit.scale).map((hit) => hit.letter),
    );
    if (affirmed.size === 0) {
      claims.push(
        skippedClaim(clause, hits.some((hit) => hit.scale) ? SCALE_NAME_REASON : NEGATED_REASON),
      );
      continue;
    }
    const affirmedWords = [...affirmed].map((letter) => RATING_LETTER_TO_WORD[letter]).join(', ');
    const facts = saoFacts(binding.star);
    if (facts.ratings.length === 0) {
      violations.push(`${binding.star} không có bậc, nhưng câu ghi ${affirmedWords}`);
      claims.push(checkedClaim(clause));
      continue;
    }
    for (const chiHit of chisIn(clause)) {
      const index = CHI.indexOf(chiHit.name);
      const bac = ratingAt(binding.star, index);
      if (bac === null) {
        violations.push(`${binding.star} không có bậc tại ${chiHit.name}`);
      } else if (!affirmed.has(bac)) {
        violations.push(
          `${binding.star} tại ${chiHit.name} là ${RATING_LETTER_TO_WORD[bac]}, không phải ${affirmedWords}`,
        );
      }
    }
    claims.push(checkedClaim(clause));
  }
  return { violations, claims };
};
