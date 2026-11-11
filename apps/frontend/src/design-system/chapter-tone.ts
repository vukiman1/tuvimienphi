export enum ChapterTone {
  Night = 'night',
  Deep = 'deep',
  Dusk = 'dusk',
  Ember = 'ember',
  Dawn = 'dawn',
  Day = 'day',
}

export const CHAPTER_TONE_CLASS: Readonly<Record<ChapterTone, string>> = {
  [ChapterTone.Night]: 'bg-night text-day',
  [ChapterTone.Deep]: 'bg-deep text-day',
  [ChapterTone.Dusk]: 'bg-dusk text-day',
  [ChapterTone.Ember]: 'bg-ember text-ink',
  [ChapterTone.Dawn]: 'bg-dawn text-ink',
  [ChapterTone.Day]: 'bg-day text-ink',
};

const DARK_TONES: ReadonlySet<ChapterTone> = new Set([
  ChapterTone.Night,
  ChapterTone.Deep,
  ChapterTone.Dusk,
]);

export function isDarkTone(tone: ChapterTone): boolean {
  return DARK_TONES.has(tone);
}
