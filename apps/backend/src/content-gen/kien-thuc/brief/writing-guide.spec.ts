import { plannedPage, type PlannedPage } from '@org/shared-kien-thuc';
import { ART_WRITTEN_AS_STAR, KIEN_THUC_FORBIDDEN } from '../validate/check-wording';
import { CALMER_PHRASINGS, writingGuideFor } from './writing-guide';

function page(): PlannedPage {
  const found = plannedPage('sao/thien-co');
  if (found === undefined) throw new Error('no page');
  return found;
}

function guideText(): string {
  return writingGuideFor(page())
    .flatMap((rule) => rule.lines)
    .join('\n');
}

describe('writingGuideFor', () => {
  it('prints every forbidden phrase and art form the validator rejects', () => {
    const text = guideText();
    for (const phrase of [...KIEN_THUC_FORBIDDEN, ...ART_WRITTEN_AS_STAR]) {
      expect(text).toContain(phrase);
    }
  });

  it('offers the calmer phrasings', () => {
    const text = guideText();
    for (const phrasing of CALMER_PHRASINGS) {
      expect(text).toContain(phrasing.avoid);
      expect(text).toContain(phrasing.write);
    }
  });
});
