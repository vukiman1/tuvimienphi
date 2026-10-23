import type { ChapterDefinition } from './chapter-definition';
import { CONG_DANH_CHAPTER } from '../chapters/cong-danh/cong-danh.chapter';
import {
  CHAPTER_CONG_DANH,
  CHAPTER_MENH,
  CHAPTER_TAI_BACH,
  CHAPTER_THAN_CU,
  CHAPTER_TINH_DUYEN,
} from '../luan-giai.constants';
import { MENH_CHAPTER } from '../chapters/menh/menh.chapter';
import { TAI_BACH_CHAPTER } from '../chapters/tai-bach/tai-bach.chapter';
import { THAN_CU_CHAPTER } from '../chapters/than-cu/than-cu.chapter';
import { TINH_DUYEN_CHAPTER } from '../chapters/tinh-duyen/tinh-duyen.chapter';

export const CHAPTER_DEFINITIONS: ReadonlyMap<string, ChapterDefinition> = new Map<
  string,
  ChapterDefinition
>([
  [CHAPTER_THAN_CU, THAN_CU_CHAPTER],
  [CHAPTER_MENH, MENH_CHAPTER],
  [CHAPTER_CONG_DANH, CONG_DANH_CHAPTER],
  [CHAPTER_TAI_BACH, TAI_BACH_CHAPTER],
  [CHAPTER_TINH_DUYEN, TINH_DUYEN_CHAPTER],
]);
