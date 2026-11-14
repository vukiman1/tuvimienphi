import { nhiHopIndex, tamHopIndexes, xungChieuIndex, type CungName } from '@org/shared-tu-vi';
import type { ChartView } from '@/features/la-so/chart-types';

const DAI_VAN_YEARS = 10;

type AnNgu = 'Tuần' | 'Triệt';

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
  const anNgu: AnNgu[] = [];
  if (hasTuan) anNgu.push('Tuần');
  if (hasTriet) anNgu.push('Triệt');
  return anNgu;
}

export function cungFacts(chart: ChartView, index: number): CungFacts {
  const cung = chart.cungs[index];
  const nameAt = (cungIndex: number): CungName => chart.cungs[cungIndex].cungName;
  const [tamHopFirst, tamHopSecond] = tamHopIndexes(index);
  const xungChieu = nameAt(xungChieuIndex(index));

  return {
    cungName: cung.cungName,
    daiVan: { from: cung.daiVanStartAge, to: cung.daiVanStartAge + DAI_VAN_YEARS - 1 },
    tamHop: [nameAt(tamHopFirst), nameAt(tamHopSecond)],
    xungChieu,
    nhiHop: nameAt(nhiHopIndex(index)),
    anNgu: anNguOf(cung.hasTuan, cung.hasTriet),
    muonTu: cung.isVoChinhDieu ? xungChieu : null,
  };
}
