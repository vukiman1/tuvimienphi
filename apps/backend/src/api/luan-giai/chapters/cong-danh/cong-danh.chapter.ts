import { buildCongDanhBrief, buildCongDanhMucBriefs } from '@org/shared-tu-vi';
import { type ChapterDefinition, MucKind } from '../../generation/chapter-definition';
import { CONG_DANH_SYSTEM_PROMPT } from './cong-danh.prompt';
import { KHUNG_CONG_DANH } from './cong-danh.khung';

export const CONG_DANH_CHAPTER = {
  name: 'cong-danh',
  buildBrief: buildCongDanhBrief,
  buildMucs: (chart) =>
    buildCongDanhMucBriefs(chart).map((brief) => ({ kind: MucKind.PhuTinh, brief })),
  systemPrompt: CONG_DANH_SYSTEM_PROMPT,
  khung: () => KHUNG_CONG_DANH,
} satisfies ChapterDefinition;
