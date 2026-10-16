import type { CungName } from '../../dia-ban.js';
import type { ChinhTinhName, PhuTinhName } from '../../sao-names.js';
import type { LuanDe } from '../luan-de.js';
import type { CellLuan } from './cell-luan.js';

export interface CungLuanBang {
  readonly cung: CungName;
  readonly chinhTinh: Readonly<Partial<Record<ChinhTinhName, CellLuan>>>;
  readonly phuTinh: Readonly<Partial<Record<PhuTinhName, LuanDe>>>;
  readonly hoaKy: { readonly y: string; readonly tuKhoa: readonly string[] };
  readonly dungCachCuc: boolean;
}
