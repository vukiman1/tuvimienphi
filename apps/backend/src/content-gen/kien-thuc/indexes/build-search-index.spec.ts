import { lessonFile, TA_PHU_ENTRY } from '../store/content-fixtures';
import type { ContentFiles } from '../store/content-store';
import { buildSearchIndex } from './build-search-index';

describe('buildSearchIndex', () => {
  it('indexes lessons and entries with their aliases and summaries', () => {
    const files: ContentFiles = {
      lessons: [lessonFile('tu-vi-la-gi', 1, 1, 'Tử vi là gì')],
      entries: [TA_PHU_ENTRY],
    };
    const index = buildSearchIndex(files);
    const lesson = index.find((item) => item.slug === 'tu-vi-la-gi');
    const entry = index.find((item) => item.slug === 'ta-phu');
    expect(lesson?.aliases).toEqual([]);
    expect(lesson?.summary).toContain('Tử vi là gì');
    expect(entry?.aliases).toEqual(['Tả Hữu']);
    expect(entry?.summary).toContain('Tả Phù');
  });
});
