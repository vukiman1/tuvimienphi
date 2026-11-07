import { LOI_DOA } from '../api/luan-giai/validate/check-forbidden-phrases';

const LOI_DOA_TET = ['đại họa'] as const;
const LOI_BAN_HANG = ['phải cúng', 'nên mua', 'bắt buộc cúng'] as const;
const CUM_BI_CAM = [...LOI_DOA, ...LOI_DOA_TET, ...LOI_BAN_HANG] as const;

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

export function normalize(text: string): string {
  return OLD_STYLE_TONE_MARKS.reduce(
    (result, [pattern, replacement]) => result.replace(pattern, replacement),
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

export function forbiddenPhraseViolations(text: string): string[] {
  const normalized = normalize(text);
  return CUM_BI_CAM.filter((phrase) => normalized.includes(phrase)).map(
    (phrase) => `dùng cụm bị cấm "${phrase}"`,
  );
}
