const SENTENCE_END = /[.!?](\s|$)/g;
const BOLD = /\*\*([^*]+)\*\*/g;
const HIGHLIGHT = /==([^=]+)==/g;
const RATING_SUFFIX = /\s*\([MVĐBH]\)\s*$/;

export function countSentences(text: string): number {
  return text.match(SENTENCE_END)?.length ?? 0;
}

export function sentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).filter((cau) => cau.trim().length > 0);
}

/** Mỗi cặp `**...**` là một nhóm; dấu phẩy bên trong tách thành nhiều tên sao. */
export function boldGroups(text: string): string[][] {
  return [...text.matchAll(BOLD)].map((khop) => khop[1].split(',').map((ten) => ten.trim()));
}

export function highlights(text: string): string[] {
  return [...text.matchAll(HIGHLIGHT)].map((khop) => khop[1].trim());
}

export function stripRating(token: string): string {
  return token.replace(RATING_SUFFIX, '').trim();
}

export function ratingOf(token: string): string | null {
  return token.match(/\(([MVĐBH])\)\s*$/)?.[1] ?? null;
}
