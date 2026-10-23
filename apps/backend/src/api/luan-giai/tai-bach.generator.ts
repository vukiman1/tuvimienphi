import { Injectable } from '@nestjs/common';
import { buildTaiBachBrief, buildTaiBachMucBriefs } from '@org/shared-tu-vi';
import { AiClient } from '../../ai/port/ai.client';
import { type CungChapter, CungChapterGenerator, MucKind } from './cung-chapter.generator';
import { TAI_BACH_SYSTEM_PROMPT } from './prompt/tai-bach-prompt';
import { KHUNG_TAI_BACH } from './prompt/khung-tai-bach';

const TAI_BACH_CHAPTER = {
  buildBrief: buildTaiBachBrief,
  buildMucs: (chart) =>
    buildTaiBachMucBriefs(chart).map((brief) => ({ kind: MucKind.PhuTinh, brief })),
  systemPrompt: TAI_BACH_SYSTEM_PROMPT,
  khung: KHUNG_TAI_BACH,
} satisfies CungChapter;

@Injectable()
export class TaiBachGenerator extends CungChapterGenerator {
  constructor(ai: AiClient) {
    super(ai, TAI_BACH_CHAPTER);
  }
}
