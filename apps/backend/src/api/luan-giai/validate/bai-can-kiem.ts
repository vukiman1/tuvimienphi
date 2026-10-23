import type { Sac } from '@org/shared-tu-vi';

export interface BaiCanKiem {
  readonly doan: readonly string[];
  readonly doanCuaSac: Readonly<Record<Sac, number>>;
}
