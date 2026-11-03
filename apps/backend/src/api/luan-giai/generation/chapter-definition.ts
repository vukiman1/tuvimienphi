import type { LuanGiaiSection } from '@org/shared-contracts';
import type { ChapterBrief, ChapterMucBrief, NatalChart } from '@org/shared-tu-vi';
import type { KhungChuong } from '../article/khung-chuong';

export interface ChapterContext {
  readonly viewYear: number | null;
  readonly currentYear: number;
}

export enum MucKind {
  PhuTinh = 'phu-tinh',
  CungKhac = 'cung-khac',
  Rendered = 'rendered',
}

export type MucCanSinh =
  | {
      readonly kind: MucKind.PhuTinh;
      readonly brief: ChapterMucBrief;
      readonly systemPrompt?: string;
      readonly isRequired?: boolean;
    }
  | {
      readonly kind: MucKind.CungKhac;
      readonly brief: ChapterMucBrief;
      readonly systemPrompt: string;
    }
  | { readonly kind: MucKind.Rendered; readonly section: LuanGiaiSection };

export type MucCanGoiMoHinh = Exclude<MucCanSinh, { readonly kind: MucKind.Rendered }>;

export interface ChapterDefinition {
  readonly name: string;
  readonly buildBrief: (chart: NatalChart, context: ChapterContext) => ChapterBrief | null;
  readonly buildMucs: (chart: NatalChart, context: ChapterContext) => readonly MucCanSinh[];
  readonly systemPrompt: string;
  readonly khung: (brief: ChapterBrief, chart: NatalChart, context: ChapterContext) => KhungChuong;
}
