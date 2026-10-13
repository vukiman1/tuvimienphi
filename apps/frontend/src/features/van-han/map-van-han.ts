import type { VanHanEntry } from '@org/shared-contracts';

export interface VanHanAspect {
  readonly label: string;
  readonly rating: number;
  readonly points: readonly string[];
}

export interface VanHanBirthYearFortune {
  readonly birthYear: number;
  readonly canChi: string;
  readonly menh: string;
  readonly male: string;
  readonly female: string;
}

export interface VanHanFortune {
  readonly birthYears: readonly number[];
  readonly overview: readonly string[];
  readonly aspects: readonly VanHanAspect[];
  readonly byBirthYear: readonly VanHanBirthYearFortune[];
}

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
