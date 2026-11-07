import { BAT_HAN, CUU_DIEU, HoangOc, KimLau } from '@org/shared-tu-vi';
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

const OLD_STYLE_TONE_MARKS: readonly (readonly [RegExp, string])[] = [
  [/oà/g, 'òa'],
  [/oá/g, 'óa'],
  [/oả/g, 'ỏa'],
  [/oã/g, 'õa'],
  [/oạ/g, 'ọa'],
  [/oè/g, 'òe'],
  [/oé/g, 'óe'],
  [/oẻ/g, 'ỏe'],
  [/oẽ/g, 'õe'],
  [/oẹ/g, 'ọe'],
  [/uỳ/g, 'ùy'],
  [/uý/g, 'úy'],
  [/uỷ/g, 'ủy'],
  [/uỹ/g, 'ũy'],
  [/uỵ/g, 'ụy'],
];

const NAME_ALIASES: Readonly<Record<string, string>> = {
  'Vân Hán': 'Vân Hớn',
  'Hoàng Tuyền': 'Huỳnh Tuyền',
};

const VOCABULARY: readonly string[] = [...CUU_DIEU, ...BAT_HAN, ...Object.values(HoangOc)];
const NO_KIM_LAU_PHRASE = 'không phạm kim lâu';
const FAQ_GENDER_PREFIXES = { nam: 'nam', nu: 'nữ' } as const;

function normalize(text: string): string {
  return OLD_STYLE_TONE_MARKS.reduce(
    (result, [pattern, replacement]) => result.replace(pattern, replacement),
    text.normalize('NFC').toLowerCase(),
  );
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function mentions(text: string, name: string): boolean {
  const pattern = new RegExp(`(?<!\\p{L})${escapeRegExp(normalize(name))}(?!\\p{L})`, 'u');
  return pattern.test(normalize(text));
}

function namesIn(text: string): readonly string[] {
  const aliased = Object.entries(NAME_ALIASES)
    .filter(([alias]) => mentions(text, alias))
    .map(([, canonical]) => canonical);
  const direct = VOCABULARY.filter((name) => mentions(text, name));
  return [...new Set([...direct, ...aliased])];
}

function genderNames(brief: TuoiNamBrief, gender: 'nam' | 'nu' | null): readonly string[] {
  const { nam, nu } = brief.facts;
  if (gender === 'nam') return [nam.sao, nam.han];
  if (gender === 'nu') return [nu.sao, nu.han];
  return [nam.sao, nam.han, nu.sao, nu.han];
}

function sectionGender(section: TuoiNamSection): 'nam' | 'nu' | null {
  if (section === TuoiNamSection.SaoHanNam) return 'nam';
  if (section === TuoiNamSection.SaoHanNu) return 'nu';
  return null;
}

function allowedNames(brief: TuoiNamBrief, section: TuoiNamSection): readonly string[] {
  const names = genderNames(brief, sectionGender(section));
  return section === TuoiNamSection.CuoiNha ? [...names, brief.facts.hoangOc] : names;
}

function faqGender(question: string): 'nam' | 'nu' | null {
  const start = normalize(question).trimStart();
  if (start.startsWith(FAQ_GENDER_PREFIXES.nam)) return 'nam';
  if (start.startsWith(FAQ_GENDER_PREFIXES.nu)) return 'nu';
  return null;
}

function allText(draft: TuoiNamDraft): string {
  return [
    ...SECTIONS.flatMap((section) => draft[section]),
    ...draft.faq.flatMap(({ question, answer }) => [question, answer]),
  ].join('\n');
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
  const sectionViolations = SECTIONS.flatMap((section) => {
    const allowed = allowedNames(brief, section);
    return namesIn(draft[section].join('\n'))
      .filter((name) => !allowed.includes(name))
      .map((name) => `mục ${section}: nhắc "${name}" mà brief không tính cho mục này`);
  });
  const faqViolations = draft.faq.flatMap(({ question, answer }, index) => {
    const allowed = [...genderNames(brief, faqGender(question)), brief.facts.hoangOc];
    return namesIn(`${question}\n${answer}`)
      .filter((name) => !allowed.includes(name))
      .map((name) => `faq câu ${index + 1}: nhắc "${name}" mà brief không tính cho câu này`);
  });
  return [...sectionViolations, ...faqViolations];
}

function checkKimLau(draft: TuoiNamDraft, brief: TuoiNamBrief): string[] {
  const text = normalize(allText(draft));
  if (brief.facts.kimLau !== null) {
    return text.includes(NO_KIM_LAU_PHRASE)
      ? [`nói "không phạm Kim lâu" nhưng brief tính tuổi này phạm Kim lâu ${brief.facts.kimLau}`]
      : [];
  }
  return Object.values(KimLau)
    .filter((kind) => mentions(text, `kim lâu ${kind}`))
    .map((kind) => `nhắc "Kim lâu ${kind}" nhưng brief tính tuổi này không phạm Kim lâu`);
}

function checkForbiddenPhrases(draft: TuoiNamDraft): string[] {
  const text = normalize(allText(draft));
  return CUM_BI_CAM.filter((phrase) => text.includes(phrase)).map(
    (phrase) => `dùng cụm bị cấm "${phrase}"`,
  );
}

export function checkTuoiNam(draft: TuoiNamDraft, brief: TuoiNamBrief): readonly string[] {
  return [
    ...checkLength(draft),
    ...checkClaims(draft, brief),
    ...checkInventedFacts(draft, brief),
    ...checkKimLau(draft, brief),
    ...checkForbiddenPhrases(draft),
  ];
}
