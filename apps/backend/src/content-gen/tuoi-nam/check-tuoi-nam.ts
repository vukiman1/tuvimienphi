import {
  BAT_HAN,
  CUU_DIEU,
  HoangOc,
  isHoangOcTot,
  KimLau,
  MenhVoiNam,
  NAP_AM_NAMES,
} from '@org/shared-tu-vi';
import { checkTamTai, checkThaiTue } from '../chi-verdicts';
import {
  affirms,
  escapeRegExp,
  forbiddenPhraseViolations,
  mentions,
  normalize,
  paragraphCountViolations,
  SECTION_MAX_PARAGRAPHS,
  SECTION_MIN_PARAGRAPHS,
  splitSentences,
} from '../check-text';
import { TuoiNamSection, type TuoiNamBrief } from './tuoi-nam.brief';
import type { TuoiNamDraft } from './tuoi-nam.schema';

const MIN_FAQ_ENTRIES = 3;
const MAX_FAQ_ENTRIES = 5;

const SECTIONS: readonly TuoiNamSection[] = Object.values(TuoiNamSection);

const NAME_ALIASES: Readonly<Record<string, string>> = {
  'Vân Hán': 'Vân Hớn',
  'Hoàng Tuyền': 'Huỳnh Tuyền',
};

const VOCABULARY: readonly string[] = [...CUU_DIEU, ...BAT_HAN, ...Object.values(HoangOc)];
const NO_KIM_LAU_PHRASE = 'không phạm kim lâu';
const CLAIM_VERBS: readonly string[] = ['phạm', 'gặp', 'bị', 'vướng', 'dính', 'rơi vào'];
const KIM_LAU_CLAIMS: readonly string[] = CLAIM_VERBS.map((verb) => `${verb} Kim lâu`);
const TAM_TAI_CLAIMS: readonly string[] = [
  ...CLAIM_VERBS.map((verb) => `${verb} Tam tai`),
  'là năm Tam tai',
];
const THAI_TUE_CLAIMS: readonly string[] = CLAIM_VERBS.map((verb) => `${verb} Thái tuế`);
const NAP_AM_VARIANT_SPELLINGS: Readonly<Record<string, string>> = {
  'Lư Trung Hỏa': 'Lô Trung Hỏa',
  'Phúc Đăng Hỏa': 'Phú Đăng Hỏa',
  'Phích Lịch Hỏa': 'Tích Lịch Hỏa',
  'Tang Đố Mộc': 'Tang Chá Mộc',
  'Đại Trạch Thổ': 'Đại Dịch Thổ',
};
const TUOI_PATTERNS: readonly RegExp[] = [
  /(?<!\p{L})tuổi (?:mụ|âm)(?: là)? (\d{1,3})(?!\d)/gu,
  /(?<!\d)(\d{1,3}) tuổi (?:mụ|âm)(?!\p{L})/gu,
];
const HOANG_OC_VERDICTS = { tot: 'cung tốt', xau: 'cung xấu' } as const;
const DIRECTIONAL_MENH_RELATIONS: readonly MenhVoiNam[] = [
  MenhVoiNam.NamSinhMenh,
  MenhVoiNam.MenhSinhNam,
  MenhVoiNam.NamKhacMenh,
  MenhVoiNam.MenhKhacNam,
];
const FAQ_GENDER_PREFIXES = { nam: 'nam', nu: 'nữ' } as const;

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
  const sectionViolations = SECTIONS.flatMap((section) =>
    paragraphCountViolations(
      section,
      draft[section],
      SECTION_MIN_PARAGRAPHS,
      SECTION_MAX_PARAGRAPHS,
    ),
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
  const { kimLau } = brief.facts;
  const wrongKinds = Object.values(KimLau)
    .filter((kind) => kind !== kimLau && mentions(text, `kim lâu ${kind}`))
    .map((kind) =>
      kimLau === null
        ? `nhắc "Kim lâu ${kind}" nhưng brief tính tuổi này không phạm Kim lâu`
        : `nhắc "Kim lâu ${kind}" nhưng brief tính tuổi này phạm Kim lâu ${kimLau}`,
    );
  const denial =
    kimLau !== null && text.includes(NO_KIM_LAU_PHRASE)
      ? [`nói "không phạm Kim lâu" nhưng brief tính tuổi này phạm Kim lâu ${kimLau}`]
      : [];
  const bareClaim =
    kimLau === null && wrongKinds.length === 0 && affirms(text, KIM_LAU_CLAIMS)
      ? ['nói tuổi này phạm Kim lâu nhưng tuổi này không phạm Kim lâu']
      : [];
  return [...denial, ...wrongKinds, ...bareClaim];
}

function checkChiVerdicts(draft: TuoiNamDraft, brief: TuoiNamBrief): string[] {
  const text = allText(draft);
  const { tamTai, thaiTue } = brief.facts;
  const bareTamTai =
    tamTai === null && affirms(text, TAM_TAI_CLAIMS)
      ? ['nói tuổi này phạm Tam tai nhưng tuổi này không phạm Tam tai']
      : [];
  const bareThaiTue =
    thaiTue.length === 0 && affirms(text, THAI_TUE_CLAIMS)
      ? ['nói tuổi này phạm Thái tuế nhưng tuổi này không phạm Thái tuế']
      : [];
  return [
    ...checkTamTai(text, brief.facts),
    ...checkThaiTue(text, brief.facts),
    ...bareTamTai,
    ...bareThaiTue,
  ];
}

function checkNapAm(draft: TuoiNamDraft, brief: TuoiNamBrief): string[] {
  const text = allText(draft);
  const { menh, menhNam } = brief.facts;
  const allowed = [menh.name, menhNam.name];
  const variants = Object.entries(NAP_AM_VARIANT_SPELLINGS)
    .filter(([variant]) => mentions(text, variant))
    .map(([variant, canonical]) => `viết "${variant}", tên đúng là "${canonical}"`);
  const wrongNames = NAP_AM_NAMES.filter(
    (name) => !allowed.includes(name) && mentions(text, name),
  ).map(
    (name) =>
      `nhắc mệnh "${name}" nhưng mệnh năm sinh là "${menh.name}" và mệnh năm xem là "${menhNam.name}"`,
  );
  return [...variants, ...wrongNames];
}

function checkTuoi(draft: TuoiNamDraft, brief: TuoiNamBrief): string[] {
  const text = normalize(allText(draft));
  const { tuoi, viewYear } = brief.facts;
  return TUOI_PATTERNS.flatMap((pattern) => [...text.matchAll(pattern)])
    .map((match) => Number(match[1]))
    .filter((written) => written !== tuoi)
    .map((written) => `viết tuổi mụ ${written} nhưng tuổi mụ năm ${viewYear} là ${tuoi}`);
}

function checkHoangOcVerdict(draft: TuoiNamDraft, brief: TuoiNamBrief): string[] {
  const { hoangOc } = brief.facts;
  const isTot = isHoangOcTot(hoangOc);
  const right = isTot ? HOANG_OC_VERDICTS.tot : HOANG_OC_VERDICTS.xau;
  const wrong = isTot ? HOANG_OC_VERDICTS.xau : HOANG_OC_VERDICTS.tot;
  const isInverted = splitSentences(allText(draft)).some(
    (sentence) =>
      mentions(sentence, hoangOc) && mentions(sentence, wrong) && !mentions(sentence, right),
  );
  return isInverted ? [`gọi cung ${hoangOc} là ${wrong} nhưng đó là ${right}`] : [];
}

function mentionsRelation(text: string, relation: MenhVoiNam): boolean {
  const pattern = new RegExp(
    `(?<!\\p{L})${escapeRegExp(normalize(relation))}(?!\\p{L})(?!\\s*\\d)`,
    'u',
  );
  return pattern.test(normalize(text));
}

function checkMenhRelation(draft: TuoiNamDraft, brief: TuoiNamBrief): string[] {
  const text = allText(draft);
  const { menhVoiNam } = brief.facts;
  return DIRECTIONAL_MENH_RELATIONS.filter(
    (relation) => relation !== menhVoiNam && mentionsRelation(text, relation),
  ).map((relation) => `nói "${relation}" nhưng quan hệ mệnh với năm là "${menhVoiNam}"`);
}

export function checkTuoiNam(draft: TuoiNamDraft, brief: TuoiNamBrief): readonly string[] {
  return [
    ...checkLength(draft),
    ...checkClaims(draft, brief),
    ...checkInventedFacts(draft, brief),
    ...checkKimLau(draft, brief),
    ...checkChiVerdicts(draft, brief),
    ...checkNapAm(draft, brief),
    ...checkTuoi(draft, brief),
    ...checkHoangOcVerdict(draft, brief),
    ...checkMenhRelation(draft, brief),
    ...forbiddenPhraseViolations(allText(draft)),
  ];
}
