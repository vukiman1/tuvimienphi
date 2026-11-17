import { ContentKind, pageRef } from '@org/shared-contracts';
import { lessonFile, THIEN_CO_ENTRY } from '../store/content-fixtures';
import { DRAFT_AUTHOR } from '../store/draft-file';
import type { StoredDraft } from '../store/draft-store';
import { corpusOf } from './corpus';

const REVISION_TEXT = 'Bản sửa của trang.';

function revision(ref: StoredDraft['ref']): StoredDraft {
  return {
    ref,
    draft: {
      summary: 'Tóm tắt mới.',
      sections: [{ heading: 'Mục', paragraphs: [REVISION_TEXT] }],
      writtenBy: DRAFT_AUTHOR,
      writtenAt: '2026-11-15T00:00:00.000Z',
    },
  };
}

describe('corpusOf', () => {
  it('holds only the draft of an entry that also has an approved copy', () => {
    const corpus = corpusOf({ lessons: [], entries: [THIEN_CO_ENTRY] }, [revision('sao/thien-co')]);
    expect(corpus).toHaveLength(1);
    expect(corpus[0].plainText).toContain(REVISION_TEXT);
  });

  it('holds only the draft of a lesson that also has an approved copy', () => {
    const lesson = lessonFile('tu-vi-la-gi', 1, 1, 'Tử vi là gì');
    const corpus = corpusOf({ lessons: [lesson], entries: [] }, [
      revision(pageRef(ContentKind.Bai, lesson.slug)),
    ]);
    expect(corpus).toHaveLength(1);
    expect(corpus[0].plainText).toContain(REVISION_TEXT);
  });

  it('keeps approved pages that have no draft', () => {
    const corpus = corpusOf({ lessons: [], entries: [THIEN_CO_ENTRY] }, [revision('cung/menh')]);
    expect(corpus.map((page) => page.ref)).toEqual(['sao/thien-co', 'cung/menh']);
  });
});
