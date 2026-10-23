import { buildTaiBachBrief, buildTaiBachMucBriefs } from '@org/shared-tu-vi';
import { type ChapterDefinition, MucKind } from './chapter-definition';
import { KHUNG_TAI_BACH } from './prompt/khung-tai-bach';
import { TAI_BACH_SYSTEM_PROMPT } from './prompt/tai-bach-prompt';

export const TAI_BACH_CHAPTER = {
  name: 'tai-bach',
  buildBrief: buildTaiBachBrief,
  buildMucs: (chart) =>
    buildTaiBachMucBriefs(chart).map((brief) => ({ kind: MucKind.PhuTinh, brief })),
  systemPrompt: TAI_BACH_SYSTEM_PROMPT,
  khung: () => KHUNG_TAI_BACH,
} satisfies ChapterDefinition;
