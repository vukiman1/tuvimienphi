import type { ChapterDefinition } from './chapter-definition';
import { CONG_DANH_CHAPTER } from './cong-danh.chapter';
import {
  CHAPTER_CONG_DANH,
  CHAPTER_MENH,
  CHAPTER_TAI_BACH,
  CHAPTER_THAN_CU,
  CHAPTER_TINH_DUYEN,
} from './luan-giai.constants';
import { MENH_CHAPTER } from './menh.chapter';
import { TAI_BACH_CHAPTER } from './tai-bach.chapter';
import { THAN_CU_CHAPTER } from './than-cu.chapter';
import { TINH_DUYEN_CHAPTER } from './tinh-duyen.chapter';

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
