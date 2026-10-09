import type { ChapterBrief } from '@org/shared-tu-vi';

export function serializeBriefForPrompt(brief: ChapterBrief): string {
  return JSON.stringify(brief, (key, value) => (key === 'trong' ? undefined : value), 2);
}
