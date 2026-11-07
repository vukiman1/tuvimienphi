import { CHI } from '@org/shared-tu-vi';
import { checkTamTai, checkThaiTue } from '../chi-verdicts';
import {
  escapeRegExp,
  forbiddenPhraseViolations,
  mentions,
  paragraphCountViolations,
  SECTION_MAX_PARAGRAPHS,
  SECTION_MIN_PARAGRAPHS,
} from '../check-text';
import { ConGiapSection, type ConGiapBrief } from './con-giap.brief';
import type { ConGiapDraft } from './con-giap.schema';

const SECTIONS: readonly ConGiapSection[] = Object.values(ConGiapSection);
const CHI_SPELLINGS: Readonly<Record<string, readonly string[]>> = { Tị: ['Tị', 'Tỵ'] };

function chiSpellings(name: string): readonly string[] {
  return CHI_SPELLINGS[name] ?? [name];
}

function mentionsChi(text: string, name: string): boolean {
  const alternatives = chiSpellings(name).map(escapeRegExp).join('|');
  return new RegExp(`(?<!\\p{L})(?:${alternatives})(?!\\p{L})`, 'u').test(text.normalize('NFC'));
}

function isChiName(keyword: string): boolean {
  return (CHI as readonly string[]).includes(keyword);
}

function mentionsKeyword(text: string, keyword: string): boolean {
  return isChiName(keyword) ? mentionsChi(text, keyword) : mentions(text, keyword);
}

function allText(draft: ConGiapDraft): string {
  return SECTIONS.flatMap((section) => draft[section]).join('\n');
}

function checkLength(draft: ConGiapDraft): string[] {
  return SECTIONS.flatMap((section) =>
    paragraphCountViolations(
      section,
      draft[section],
      SECTION_MIN_PARAGRAPHS,
      SECTION_MAX_PARAGRAPHS,
    ),
  );
}

function checkClaims(draft: ConGiapDraft, brief: ConGiapBrief): string[] {
  return brief.claims
    .filter((claim) => !mentionsKeyword(draft[claim.section].join('\n'), claim.keyword))
    .map((claim) => `mục ${claim.section}: thiếu "${claim.keyword}"`);
}

function checkInventedChi(draft: ConGiapDraft, brief: ConGiapBrief): string[] {
  const { chi, viewChi, xongDat } = brief.facts;
  const allowed = new Set([chi, viewChi, ...xongDat.hop, ...xongDat.tranh]);
  const text = draft[ConGiapSection.XongDat].join('\n');
  return CHI.filter((name, index) => !allowed.has(index) && mentionsChi(text, name)).map(
    (name) => `mục ${ConGiapSection.XongDat}: nhắc tuổi "${name}" mà brief không liệt kê`,
  );
}

export function checkConGiap(draft: ConGiapDraft, brief: ConGiapBrief): readonly string[] {
  return [
    ...checkLength(draft),
    ...checkClaims(draft, brief),
    ...checkInventedChi(draft, brief),
    ...checkTamTai(allText(draft), brief.facts),
    ...checkThaiTue(allText(draft), brief.facts),
    ...forbiddenPhraseViolations(allText(draft)),
  ];
}
