import { CHAPTER_TONE_CLASS, ChapterTone } from '@/design-system';
import { cn } from '@/lib/utils';

export const SAMPLE_BOARD_PANEL_CLASS = cn(
  'rounded-2xl p-4 sm:p-6',
  CHAPTER_TONE_CLASS[ChapterTone.Night],
);
export const SAMPLE_BOARD_PLACEHOLDER_CLASS = cn(
  SAMPLE_BOARD_PANEL_CLASS,
  'min-h-244 sm:min-h-221 md:min-h-242 lg:min-h-241 xl:min-h-282',
);
export const SAMPLE_CHART_LESSON_SLUG = 'doc-la-so-cua-chinh-ban';
