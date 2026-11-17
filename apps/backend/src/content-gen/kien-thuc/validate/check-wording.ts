import {
  forbiddenPhraseViolations,
  normalize,
  OLD_STYLE_OA_OE,
  OLD_STYLE_UY,
} from '../../check-text';
import { toPlainText } from '../text/link-markup';
import type { PageDraftBody } from './check-shape';

export const KIEN_THUC_FORBIDDEN: readonly string[] = ['đại hạn', 'chết', 'khó tránh'];
export const ART_WRITTEN_AS_STAR: readonly string[] = [
  'môn Tử Vi',
  'lá số Tử Vi',
  'xem Tử Vi',
  'học Tử Vi',
  'Tử Vi Đẩu Số',
];

const CHI_TY = 'tỵ';
const CHI_TY_FIXED = 'ị';
const TOKEN_BREAK = /[^\p{L}]+/u;

function correctToken(token: string): string | null {
  const lower = token.toLowerCase();
  if (lower === CHI_TY) return token.replace('ỵ', CHI_TY_FIXED);
  for (const [cluster, fixed] of OLD_STYLE_OA_OE) {
    if (lower.endsWith(cluster)) return token.slice(0, token.length - cluster.length) + fixed;
  }
  for (const [cluster, fixed] of OLD_STYLE_UY) {
    if (!lower.endsWith(cluster)) continue;
    const before = lower[lower.length - cluster.length - 1];
    if (before === 'q') return null;
    return token.slice(0, token.length - cluster.length) + fixed;
  }
  return null;
}

function toneViolations(text: string): readonly string[] {
  const seen = new Set<string>();
  const violations: string[] = [];
  for (const token of text.normalize('NFC').split(TOKEN_BREAK).filter(Boolean)) {
    if (seen.has(token)) continue;
    seen.add(token);
    const corrected = correctToken(token);
    if (corrected !== null) {
      violations.push(`viết "${token}" theo kiểu cũ, viết "${corrected}"`);
    }
  }
  return violations;
}

function kienThucForbidden(plainText: string): readonly string[] {
  const normalized = normalize(plainText);
  return KIEN_THUC_FORBIDDEN.filter((phrase) => normalized.includes(phrase)).map(
    (phrase) => `dùng cụm bị cấm "${phrase}"`,
  );
}

function artViolations(plainText: string): readonly string[] {
  const text = plainText.normalize('NFC');
  return ART_WRITTEN_AS_STAR.filter((art) => text.includes(art)).map(
    (art) => `viết "${art}" như tên sao; dùng "tử vi" thường khi nói về môn học`,
  );
}

export function checkWording(body: PageDraftBody): readonly string[] {
  const plainText = [body.summary, ...body.sections.flatMap((s) => [s.heading, ...s.paragraphs])]
    .map(toPlainText)
    .join('\n');
  return [
    ...forbiddenPhraseViolations(plainText),
    ...kienThucForbidden(plainText),
    ...toneViolations(plainText),
    ...artViolations(plainText),
  ];
}
