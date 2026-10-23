import { buildMenhBrief, buildMenhMucBriefs } from '@org/shared-tu-vi';
import { type ChapterDefinition, MucKind } from '../../generation/chapter-definition';
import { KHUNG_MENH } from './menh.khung';
import { MENH_SYSTEM_PROMPT } from './menh.prompt';

export const MENH_CHAPTER = {
  name: 'menh',
  buildBrief: buildMenhBrief,
  buildMucs: (chart) =>
    buildMenhMucBriefs(chart).map((brief) => ({ kind: MucKind.PhuTinh, brief })),
  systemPrompt: MENH_SYSTEM_PROMPT,
  khung: () => KHUNG_MENH,
} satisfies ChapterDefinition;
