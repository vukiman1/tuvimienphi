import { buildMucBriefs, buildThanCuBrief } from '@org/shared-tu-vi';
import { type ChapterDefinition, MucKind } from './chapter-definition';
import { khungThanCu } from './prompt/khung-than-cu';
import { THAN_CU_SYSTEM_PROMPT } from './prompt/than-cu-prompt';

export const THAN_CU_CHAPTER = {
  name: 'than-cu',
  buildBrief: buildThanCuBrief,
  buildMucs: (chart) => buildMucBriefs(chart).map((brief) => ({ kind: MucKind.PhuTinh, brief })),
  systemPrompt: THAN_CU_SYSTEM_PROMPT,
  khung: (brief) => khungThanCu(brief.cung),
} satisfies ChapterDefinition;
