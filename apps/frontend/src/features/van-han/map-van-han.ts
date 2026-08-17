import type { VanHanEntry } from '@org/shared-contracts';
import type { VanHanFortune } from './placeholder-data';

function splitSentences(text: string): string[] {
  return (text ?? '')
    .split(/(?<=[.!?…])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

export function toVanHanFortune(entry: VanHanEntry): VanHanFortune {
  return {
    birthYears: entry.bornYears ?? [],
    overview: (entry.luuNien ?? '')
      .split('\n')
      .map((paragraph) => paragraph.trim())
      .filter(Boolean),
    aspects: (entry.luanGiai ?? []).map((aspect) => ({
      label: aspect.aspect,
      rating: aspect.rating ?? 0,
      points: splitSentences(aspect.body),
    })),
    byBirthYear: (entry.tungTuoi ?? []).map((age) => ({
      birthYear: age.birthYear ?? 0,
      canChi: age.canChi ?? '',
      menh: age.menh ?? '',
      male: age.male ?? '',
      female: age.female ?? '',
    })),
  };
}
