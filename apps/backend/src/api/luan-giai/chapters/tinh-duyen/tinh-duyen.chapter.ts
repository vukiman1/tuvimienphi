import {
  buildGiaDaoMucBriefs,
  buildTinhDuyenBrief,
  buildTinhDuyenMucBriefs,
} from '@org/shared-tu-vi';
import {
  type ChapterDefinition,
  type MucCanSinh,
  MucKind,
} from '../../generation/chapter-definition';
import { KHUNG_TINH_DUYEN } from './tinh-duyen.khung';
import { GIA_DAO_SYSTEM_PROMPT, TINH_DUYEN_SYSTEM_PROMPT } from './tinh-duyen.prompt';

export const TINH_DUYEN_CHAPTER = {
  name: 'tinh-duyen',
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
  khung: () => KHUNG_TINH_DUYEN,
} satisfies ChapterDefinition;
