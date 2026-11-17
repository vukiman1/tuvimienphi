import { countSyllables } from '../text/syllable-count';
import type { PageDraftBody, PageLimits } from './check-shape';

function proseOf(body: PageDraftBody): string {
  return body.sections.flatMap((section) => [section.heading, ...section.paragraphs]).join(' ');
}

export function checkLength(body: PageDraftBody, limits: PageLimits): readonly string[] {
  const count = countSyllables(proseOf(body));
  if (count < limits.minSyllables || count > limits.maxSyllables) {
    return [
      `nội dung có ${count} âm tiết, cần từ ${limits.minSyllables} đến ${limits.maxSyllables} âm tiết`,
    ];
  }
  return [];
}
