const PROGRESS_START = 0;
const PROGRESS_END = 1;

export function sectionProgress(top: number, height: number, viewportHeight: number): number {
  const scrollableDistance = height - viewportHeight;
  if (scrollableDistance <= 0) {
    return PROGRESS_END;
  }
  return Math.min(PROGRESS_END, Math.max(PROGRESS_START, -top / scrollableDistance));
}
