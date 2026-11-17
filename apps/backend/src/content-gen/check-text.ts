import { LOI_DOA } from '../api/luan-giai/validate/check-forbidden-phrases';

const LOI_DOA_TET = ['đại họa'] as const;
const LOI_BAN_HANG = ['phải cúng', 'nên mua', 'bắt buộc cúng'] as const;
const LOI_NOI_VE_CACH_SOAN = [
  'brief',
  'prompt',
  'json',
  'schema',
  'dữ kiện',
  'dữ liệu được cung cấp',
  'thông tin được cung cấp',
  'dữ liệu đầu vào',
  'mô hình ngôn ngữ',
  'trí tuệ nhân tạo',
] as const;
const CUM_BI_CAM = [...LOI_DOA, ...LOI_DOA_TET, ...LOI_BAN_HANG, ...LOI_NOI_VE_CACH_SOAN] as const;

export type ToneMarkFix = readonly [oldStyle: string, newStyle: string];

export const OLD_STYLE_OA_OE: readonly ToneMarkFix[] = [
  ['oà', 'òa'],
  ['oá', 'óa'],
  ['oả', 'ỏa'],
  ['oã', 'õa'],
  ['oạ', 'ọa'],
  ['oè', 'òe'],
  ['oé', 'óe'],
  ['oẻ', 'ỏe'],
  ['oẽ', 'õe'],
  ['oẹ', 'ọe'],
];

export const OLD_STYLE_UY: readonly ToneMarkFix[] = [
  ['uỳ', 'ùy'],
  ['uý', 'úy'],
  ['uỷ', 'ủy'],
  ['uỹ', 'ũy'],
  ['uỵ', 'ụy'],
];

const OLD_STYLE_TONE_MARKS: readonly ToneMarkFix[] = [...OLD_STYLE_OA_OE, ...OLD_STYLE_UY];

export function normalize(text: string): string {
  return OLD_STYLE_TONE_MARKS.reduce(
    (result, [oldStyle, newStyle]) => result.replaceAll(oldStyle, newStyle),
    text.normalize('NFC').toLowerCase(),
  );
}

export function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function mentions(text: string, name: string): boolean {
  const pattern = new RegExp(`(?<!\\p{L})${escapeRegExp(normalize(name))}(?!\\p{L})`, 'u');
  return pattern.test(normalize(text));
}

const NEGATION_WORDS: readonly string[] = ['không', 'chẳng', 'chưa'];
const GENERIC_SUBJECT_WORDS: readonly string[] = ['tuổi', 'người', 'ai', 'nếu', 'khi', 'những'];
const NEGATION_WINDOW_WORDS = 2;
const SENTENCE_BREAK = /(?<=[.!?])\s+|\n/u;
const CLAUSE_BREAK = /[,;:]/u;
const QUESTION_MARK = '?';
const WORD_SEPARATOR = /[^\p{L}\p{N}]+/u;

export function splitSentences(text: string): readonly string[] {
  return text.split(SENTENCE_BREAK);
}

function precedingWords(sentence: string, index: number): readonly string[] {
  const clause = sentence.slice(0, index).split(CLAUSE_BREAK).pop() ?? '';
  return clause.split(WORD_SEPARATOR).filter((word) => word !== '');
}

export function isAffirmedAt(sentence: string, index: number): boolean {
  const words = precedingWords(sentence, index);
  const lastWord = words[words.length - 1];
  if (lastWord !== undefined && GENERIC_SUBJECT_WORDS.includes(lastWord)) return false;
  return !words.slice(-NEGATION_WINDOW_WORDS).some((word) => NEGATION_WORDS.includes(word));
}

export function affirms(text: string, claims: readonly string[]): boolean {
  const sentences = splitSentences(normalize(text)).filter(
    (sentence) => !sentence.trimEnd().endsWith(QUESTION_MARK),
  );
  return claims.some((claim) => {
    const pattern = new RegExp(`(?<!\\p{L})${escapeRegExp(normalize(claim))}(?!\\p{L})`, 'gu');
    return sentences.some((sentence) =>
      [...sentence.matchAll(pattern)].some((match) => isAffirmedAt(sentence, match.index)),
    );
  });
}

export function forbiddenPhraseViolations(text: string): string[] {
  const normalized = normalize(text);
  return CUM_BI_CAM.filter((phrase) => normalized.includes(phrase)).map(
    (phrase) => `dùng cụm bị cấm "${phrase}"`,
  );
}

export const SECTION_MIN_PARAGRAPHS = 2;
export const SECTION_MAX_PARAGRAPHS = 4;

export function paragraphCountViolations(
  label: string,
  paragraphs: readonly string[],
  min: number,
  max: number,
): string[] {
  if (paragraphs.length >= min && paragraphs.length <= max) return [];
  return [`mục ${label}: có ${paragraphs.length} đoạn, cần từ ${min} đến ${max} đoạn`];
}
