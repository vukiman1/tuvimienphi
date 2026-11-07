import { BAT_HAN, CUU_DIEU } from '@org/shared-tu-vi';
import { LOI_DOA } from '../../api/luan-giai/validate/check-forbidden-phrases';
import { TuoiNamSection, type TuoiNamBrief } from './tuoi-nam.brief';
import type { TuoiNamDraft } from './tuoi-nam.schema';

const MIN_PARAGRAPHS = 2;
const MAX_PARAGRAPHS = 4;
const MIN_FAQ_ENTRIES = 3;
const MAX_FAQ_ENTRIES = 5;

const LOI_DOA_TET = ['đại họa'] as const;
const LOI_BAN_HANG = ['phải cúng', 'nên mua', 'bắt buộc cúng'] as const;
const CUM_BI_CAM = [...LOI_DOA, ...LOI_DOA_TET, ...LOI_BAN_HANG] as const;

const SECTIONS: readonly TuoiNamSection[] = Object.values(TuoiNamSection);

function normalize(text: string): string {
  return text.normalize('NFC').toLowerCase();
}

function mentions(text: string, name: string): boolean {
  const pattern = new RegExp(`(?<!\\p{L})${escapeRegExp(normalize(name))}(?!\\p{L})`, 'u');
  return pattern.test(normalize(text));
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function allowedNames(brief: TuoiNamBrief, section: TuoiNamSection): readonly string[] {
  const { nam, nu } = brief.facts;
  if (section === TuoiNamSection.SaoHanNam) return [nam.sao, nam.han];
  if (section === TuoiNamSection.SaoHanNu) return [nu.sao, nu.han];
  return [nam.sao, nam.han, nu.sao, nu.han];
}

function checkLength(draft: TuoiNamDraft): string[] {
  const sectionViolations = SECTIONS.filter(
    (section) => draft[section].length < MIN_PARAGRAPHS || draft[section].length > MAX_PARAGRAPHS,
  ).map(
    (section) =>
      `mục ${section}: có ${draft[section].length} đoạn, cần từ ${MIN_PARAGRAPHS} đến ${MAX_PARAGRAPHS} đoạn`,
  );
  const faqViolations =
    draft.faq.length < MIN_FAQ_ENTRIES || draft.faq.length > MAX_FAQ_ENTRIES
      ? [`faq: có ${draft.faq.length} câu, cần từ ${MIN_FAQ_ENTRIES} đến ${MAX_FAQ_ENTRIES} câu`]
      : [];
  return [...sectionViolations, ...faqViolations];
}

function checkClaims(draft: TuoiNamDraft, brief: TuoiNamBrief): string[] {
  return brief.claims
    .filter((claim) => !mentions(draft[claim.section].join('\n'), claim.keyword))
    .map((claim) => `mục ${claim.section}: thiếu "${claim.keyword}"`);
}

function checkInventedFacts(draft: TuoiNamDraft, brief: TuoiNamBrief): string[] {
  return SECTIONS.flatMap((section) => {
    const allowed = allowedNames(brief, section);
    const text = draft[section].join('\n');
    return [...CUU_DIEU, ...BAT_HAN]
      .filter((name) => mentions(text, name) && !allowed.includes(name))
      .map((name) => `mục ${section}: nhắc "${name}" mà brief không tính cho mục này`);
  });
}

function checkForbiddenPhrases(draft: TuoiNamDraft): string[] {
  const text = normalize(
    [
      ...SECTIONS.flatMap((section) => draft[section]),
      ...draft.faq.flatMap(({ question, answer }) => [question, answer]),
    ].join('\n'),
  );
  return CUM_BI_CAM.filter((phrase) => text.includes(phrase)).map(
    (phrase) => `dùng cụm bị cấm "${phrase}"`,
  );
}

export function checkTuoiNam(draft: TuoiNamDraft, brief: TuoiNamBrief): readonly string[] {
  return [
    ...checkLength(draft),
    ...checkClaims(draft, brief),
    ...checkInventedFacts(draft, brief),
    ...checkForbiddenPhrases(draft),
  ];
}
