import { VAN_HAN_ASPECTS } from '@org/shared-contracts';
import type { VanHanAgeReading, VanHanAspect } from './entities/van-han.entity';

export enum VanHanMissingPart {
  LUU_NIEN = 'LUU_NIEN',
  LUAN_GIAI = 'LUAN_GIAI',
  TUNG_TUOI = 'TUNG_TUOI',
}

export interface VanHanContent {
  readonly luuNien: string;
  readonly luanGiai: readonly VanHanAspect[];
  readonly tungTuoi: readonly Pick<VanHanAgeReading, 'male' | 'female'>[];
}

export function missingParts(content: VanHanContent | null): VanHanMissingPart[] {
  if (!content) {
    return Object.values(VanHanMissingPart);
  }

  const missing: VanHanMissingPart[] = [];
  if (isBlank(content.luuNien)) {
    missing.push(VanHanMissingPart.LUU_NIEN);
  }
  if (!coversEveryAspect(content.luanGiai)) {
    missing.push(VanHanMissingPart.LUAN_GIAI);
  }
  if (!readsEveryAge(content.tungTuoi)) {
    missing.push(VanHanMissingPart.TUNG_TUOI);
  }
  return missing;
}

export function isComplete(content: VanHanContent | null): boolean {
  return missingParts(content).length === 0;
}

function coversEveryAspect(aspects: readonly VanHanAspect[]): boolean {
  return VAN_HAN_ASPECTS.every((label) =>
    aspects.some((aspect) => aspect.aspect === label && !isBlank(aspect.body)),
  );
}

function readsEveryAge(ages: VanHanContent['tungTuoi']): boolean {
  return ages.length > 0 && ages.every((age) => !isBlank(age.male) && !isBlank(age.female));
}

function isBlank(text: string): boolean {
  return text.trim() === '';
}
