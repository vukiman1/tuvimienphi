import { Injectable } from '@nestjs/common';
import { buildCongDanhBrief, buildCongDanhMucBriefs } from '@org/shared-tu-vi';
import { AiClient } from '../../ai/ai.client';
import { type CungChapter, CungChapterGenerator, MucKind } from './cung-chapter.generator';
import { CONG_DANH_SYSTEM_PROMPT } from './prompt/cong-danh-prompt';
import { KHUNG_CONG_DANH } from './prompt/khung-cong-danh';

const CONG_DANH_CHAPTER = {
  buildBrief: buildCongDanhBrief,
  buildMucs: (chart) =>
    buildCongDanhMucBriefs(chart).map((brief) => ({ kind: MucKind.PhuTinh, brief })),
  systemPrompt: CONG_DANH_SYSTEM_PROMPT,
  khung: KHUNG_CONG_DANH,
} satisfies CungChapter;

@Injectable()
export class CongDanhGenerator extends CungChapterGenerator {
  constructor(ai: AiClient) {
    super(ai, CONG_DANH_CHAPTER);
  }
}
