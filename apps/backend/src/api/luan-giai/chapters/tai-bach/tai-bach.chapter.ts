import { buildTaiBachBrief, buildTaiBachMucBriefs } from '@org/shared-tu-vi';
import { type ChapterDefinition, MucKind } from '../../generation/chapter-definition';
import { KHUNG_TAI_BACH } from './tai-bach.khung';
import { TAI_BACH_SYSTEM_PROMPT } from './tai-bach.prompt';

export const TAI_BACH_CHAPTER = {
  name: 'tai-bach',
  buildBrief: buildTaiBachBrief,
  buildMucs: (chart) =>
    buildTaiBachMucBriefs(chart).map((brief) => ({ kind: MucKind.PhuTinh, brief })),
  systemPrompt: TAI_BACH_SYSTEM_PROMPT,
  khung: () => KHUNG_TAI_BACH,
} satisfies ChapterDefinition;
