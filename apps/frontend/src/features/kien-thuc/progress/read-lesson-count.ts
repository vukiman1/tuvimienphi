export function countReadLessons(
  readSlugs: ReadonlySet<string>,
  lessonSlugs: ReadonlySet<string>,
  currentLessonSlug: string | null,
): number {
  let count = 0;
  for (const slug of lessonSlugs) {
    if (readSlugs.has(slug) || slug === currentLessonSlug) {
      count += 1;
    }
  }
  return count;
}
