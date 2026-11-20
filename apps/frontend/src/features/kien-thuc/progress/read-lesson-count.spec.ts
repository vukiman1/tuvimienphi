import { countReadLessons } from './read-lesson-count';

describe('countReadLessons', () => {
  it('counts only lessons the manifest lists', () => {
    const readSlugs = new Set(['tu-vi-la-gi', 'a-lesson-that-was-unpublished']);
    const lessonSlugs = new Set(['tu-vi-la-gi', '12-cung-tu-vi']);

    expect(countReadLessons(readSlugs, lessonSlugs, null)).toBe(1);
  });

  it('counts the lesson being finished', () => {
    const lessonSlugs = new Set(['a', 'b']);

    expect(countReadLessons(new Set(['a']), lessonSlugs, 'b')).toBe(2);
  });

  it('does not count the current lesson twice', () => {
    const lessonSlugs = new Set(['a', 'b']);

    expect(countReadLessons(new Set(['a', 'b']), lessonSlugs, 'b')).toBe(2);
  });
});
