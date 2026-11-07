import { CHI, ThaiTueRelation } from '@org/shared-tu-vi';
import {
  escapeRegExp,
  forbiddenPhraseViolations,
  mentions,
  paragraphCountViolations,
  SECTION_MAX_PARAGRAPHS,
  SECTION_MIN_PARAGRAPHS,
} from '../check-text';
import {
  ConGiapSection,
  NO_TAM_TAI_KEYWORD,
  NO_THAI_TUE_KEYWORD,
  tamTaiKeyword,
  type TamTaiYear,
  thaiTueKeyword,
  type ConGiapBrief,
} from './con-giap.brief';
import type { ConGiapDraft } from './con-giap.schema';

const SECTIONS: readonly ConGiapSection[] = Object.values(ConGiapSection);
const TAM_TAI_YEARS: readonly TamTaiYear[] = [1, 2, 3];
const THAI_TUE_RELATIONS: readonly ThaiTueRelation[] = Object.values(ThaiTueRelation);
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

function checkTamTai(draft: ConGiapDraft, brief: ConGiapBrief): string[] {
  const text = allText(draft);
  const { tamTai } = brief.facts;
  const wrongYears = TAM_TAI_YEARS.filter((year) => year !== tamTai)
    .filter((year) => mentions(text, tamTaiKeyword(year)))
    .map((year) =>
      tamTai === null
        ? `nhắc "${tamTaiKeyword(year)}" nhưng brief tính tuổi này không phạm Tam tai`
        : `nhắc "${tamTaiKeyword(year)}" nhưng brief tính tuổi này ở ${tamTaiKeyword(tamTai)}`,
    );
  const denial =
    tamTai !== null && mentions(text, NO_TAM_TAI_KEYWORD)
      ? [`nói "${NO_TAM_TAI_KEYWORD}" nhưng brief tính tuổi này ở ${tamTaiKeyword(tamTai)}`]
      : [];
  return [...denial, ...wrongYears];
}

function checkThaiTue(draft: ConGiapDraft, brief: ConGiapBrief): string[] {
  const text = allText(draft);
  const { thaiTue } = brief.facts;
  const wrongRelations = THAI_TUE_RELATIONS.filter((relation) => !thaiTue.includes(relation))
    .filter((relation) => mentions(text, thaiTueKeyword(relation)))
    .map((relation) => `nhắc "${thaiTueKeyword(relation)}" mà brief không tính cho tuổi này`);
  const denial =
    thaiTue.length > 0 && mentions(text, NO_THAI_TUE_KEYWORD)
      ? [`nói "${NO_THAI_TUE_KEYWORD}" nhưng brief tính tuổi này có phạm Thái tuế`]
      : [];
  return [...denial, ...wrongRelations];
}

export function checkConGiap(draft: ConGiapDraft, brief: ConGiapBrief): readonly string[] {
  return [
    ...checkLength(draft),
    ...checkClaims(draft, brief),
    ...checkInventedChi(draft, brief),
    ...checkTamTai(draft, brief),
    ...checkThaiTue(draft, brief),
    ...forbiddenPhraseViolations(allText(draft)),
  ];
}
