import type { ChapterBrief, ChapterMucBrief, NatalChart } from '@org/shared-tu-vi';
import type { KhungChuong } from '../article/khung-chuong';

export enum MucKind {
  PhuTinh = 'phu-tinh',
  CungKhac = 'cung-khac',
}

export type MucCanSinh =
  | { readonly kind: MucKind.PhuTinh; readonly brief: ChapterMucBrief }
  | {
      readonly kind: MucKind.CungKhac;
      readonly brief: ChapterMucBrief;
      readonly systemPrompt: string;
    };

export interface ChapterDefinition {
  readonly name: string;
  readonly buildBrief: (chart: NatalChart) => ChapterBrief | null;
  readonly buildMucs: (chart: NatalChart) => readonly MucCanSinh[];
  readonly systemPrompt: string;
  readonly khung: (brief: ChapterBrief) => KhungChuong;
}
