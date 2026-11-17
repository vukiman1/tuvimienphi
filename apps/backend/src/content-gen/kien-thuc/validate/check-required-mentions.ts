import { mentions } from '../../check-text';
import { toPlainText } from '../text/link-markup';
import type { PageDraftBody } from './check-shape';

export function checkRequiredMentions(
  body: PageDraftBody,
  required: readonly string[],
): readonly string[] {
  const plainText = [body.summary, ...body.sections.flatMap((s) => [s.heading, ...s.paragraphs])]
    .map(toPlainText)
    .join('\n');
  return required
    .filter((term) => !mentions(plainText, term))
    .map((term) => `thiếu nhắc đến "${term}"`);
}
