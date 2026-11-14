import { nhiHopIndex, tamHopIndexes, xungChieuIndex, type CungName } from '@org/shared-tu-vi';
import type { ChartView } from '@/features/la-so/chart-types';
import { cungNameOf } from '@/features/la-so/cung-slug';

const DAI_VAN_YEARS = 10;

export type AnNgu = 'Tuần' | 'Triệt';

export interface CungFacts {
  readonly cungName: CungName;
  readonly daiVan: { readonly from: number; readonly to: number };
  readonly tamHop: readonly [string, string];
  readonly xungChieu: string;
  readonly nhiHop: string;
  readonly anNgu: readonly AnNgu[];
  readonly muonTu: string | null;
}

function anNguOf(hasTuan: boolean, hasTriet: boolean): readonly AnNgu[] {
  return [...(hasTuan ? (['Tuần'] as const) : []), ...(hasTriet ? (['Triệt'] as const) : [])];
}

export function cungFacts(chart: ChartView, index: number): CungFacts {
  const cung = chart.cungs[index];
  const nameAt = (cungIndex: number): CungName => cungNameOf(chart.cungs[cungIndex]);
  const [tamHopFirst, tamHopSecond] = tamHopIndexes(index);
  const xungChieu = nameAt(xungChieuIndex(index));

  return {
    cungName: cungNameOf(cung),
    daiVan: { from: cung.daiVanStartAge, to: cung.daiVanStartAge + DAI_VAN_YEARS - 1 },
    tamHop: [nameAt(tamHopFirst), nameAt(tamHopSecond)],
    xungChieu,
    nhiHop: nameAt(nhiHopIndex(index)),
    anNgu: anNguOf(cung.hasTuan, cung.hasTriet),
    muonTu: cung.isVoChinhDieu ? xungChieu : null,
  };
}
