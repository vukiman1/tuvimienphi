import { ContentKind } from '@org/shared-contracts';
import type { PlannedPage } from '@org/shared-kien-thuc';
import {
  CHINH_TINH_NAMES,
  CUNG_NAMES,
  HOA_NAMES,
  type NatalChart,
  type NatalCungView,
  type SaoName,
} from '@org/shared-tu-vi';
import { splitClauses } from '../../text/clauses';
import { findNames } from '../../text/find-names';
import { checkedClaim, skippedClaim, type ClaimClause, type FactCheckResult } from './fact-subject';

const SAMPLE_CHART_LESSON_SLUG = 'doc-la-so-cua-chinh-ban';
const SAMPLE_STARS: readonly SaoName[] = [...CHINH_TINH_NAMES, ...HOA_NAMES];
const CHU_SUFFIX = ' chủ';
const MUON_WORD = 'mượn';
const NO_PALACE_REASON = 'không có cung trước sao';

function starInCung(cung: NatalCungView, star: SaoName, hasMuon: boolean): boolean {
  if (cung.chinhTinh.some((placed) => placed.name === star)) return true;
  if (hasMuon && cung.chinhTinhMuon.some((placed) => placed.name === star)) return true;
  return cung.phuTinh.some((placed) => placed.name === star);
}

export function isSampleChartLesson(page: PlannedPage): boolean {
  return page.kind === ContentKind.Bai && page.slug === SAMPLE_CHART_LESSON_SLUG;
}

export function checkSampleChart(plainText: string, chart: NatalChart): FactCheckResult {
  const cungByName = new Map(chart.cungs.map((cung) => [cung.name, cung]));
  const violations: string[] = [];
  const claims: ClaimClause[] = [];
  for (const clause of splitClauses(plainText)) {
    const text = clause.normalize('NFC');
    const stars = findNames(text, SAMPLE_STARS);
    if (stars.length === 0) continue;
    const palaces = findNames(text, CUNG_NAMES).filter(
      (hit) => !text.slice(hit.index + hit.name.length).startsWith(CHU_SUFFIX),
    );
    const hasMuon = text.includes(MUON_WORD);
    let bound = false;
    for (const star of stars) {
      const palace = palaces.filter((hit) => hit.index < star.index).pop();
      if (palace === undefined) continue;
      const cung = cungByName.get(palace.name);
      if (cung === undefined) continue;
      bound = true;
      if (!starInCung(cung, star.name, hasMuon)) {
        violations.push(`${star.name} không nằm ở cung ${palace.name} của lá số mẫu`);
      }
    }
    claims.push(bound ? checkedClaim(clause) : skippedClaim(clause, NO_PALACE_REASON));
  }
  return { violations, claims };
}
