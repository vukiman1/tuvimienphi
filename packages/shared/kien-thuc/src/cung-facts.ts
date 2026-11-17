import { CUNG_NAMES, tamHopIndexes, xungChieuIndex } from '@org/shared-tu-vi';
import type { CungName } from '@org/shared-tu-vi';

export interface CungRelationFacts {
  readonly name: CungName;
  readonly doiCung: CungName;
  readonly tamHop: readonly [CungName, CungName];
}

export function cungRelations(name: CungName): CungRelationFacts {
  const index = CUNG_NAMES.indexOf(name);
  const [first, second] = tamHopIndexes(index);
  return {
    name,
    doiCung: CUNG_NAMES[xungChieuIndex(index)],
    tamHop: [CUNG_NAMES[first], CUNG_NAMES[second]],
  };
}
