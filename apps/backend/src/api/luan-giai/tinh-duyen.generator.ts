import { Injectable } from '@nestjs/common';
import {
  buildGiaDaoMucBriefs,
  buildTinhDuyenBrief,
  buildTinhDuyenMucBriefs,
} from '@org/shared-tu-vi';
import { AiClient } from '../../ai/port/ai.client';
import {
  type CungChapter,
  CungChapterGenerator,
  type MucCanSinh,
  MucKind,
} from './cung-chapter.generator';
import { KHUNG_TINH_DUYEN } from './prompt/khung-tinh-duyen';
import { GIA_DAO_SYSTEM_PROMPT, TINH_DUYEN_SYSTEM_PROMPT } from './prompt/tinh-duyen-prompt';

const TINH_DUYEN_CHAPTER = {
  buildBrief: buildTinhDuyenBrief,
  buildMucs: (chart) => [
    ...buildTinhDuyenMucBriefs(chart).map((brief): MucCanSinh => ({
      kind: MucKind.PhuTinh,
      brief,
    })),
    ...buildGiaDaoMucBriefs(chart).map((brief): MucCanSinh => ({
      kind: MucKind.CungKhac,
      brief,
      systemPrompt: GIA_DAO_SYSTEM_PROMPT[brief.muc],
    })),
  ],
  systemPrompt: TINH_DUYEN_SYSTEM_PROMPT,
  khung: KHUNG_TINH_DUYEN,
} satisfies CungChapter;

@Injectable()
export class TinhDuyenGenerator extends CungChapterGenerator {
  constructor(ai: AiClient) {
    super(ai, TINH_DUYEN_CHAPTER);
  }
}
