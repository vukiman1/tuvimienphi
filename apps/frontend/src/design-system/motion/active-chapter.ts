export interface ChapterBounds {
  readonly top: number;
  readonly bottom: number;
}

export function chapterIndexAt(
  chapters: readonly ChapterBounds[],
  probeLine: number,
): number | null {
  const index = chapters.findIndex(({ top, bottom }) => top <= probeLine && probeLine < bottom);
  return index === -1 ? null : index;
}
