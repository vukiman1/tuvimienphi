export enum KimLau {
  Than = 'thân',
  The = 'thê',
  Tu = 'tử',
  LucSuc = 'lục súc',
}

const KIM_LAU_CYCLE = 9;

const KIM_LAU_BY_REMAINDER: ReadonlyMap<number, KimLau> = new Map([
  [1, KimLau.Than],
  [3, KimLau.The],
  [6, KimLau.Tu],
  [8, KimLau.LucSuc],
]);

export const KIM_LAU_TRUYEN_THONG = `Lấy tuổi mụ chia cho ${KIM_LAU_CYCLE}: ${[
  ...KIM_LAU_BY_REMAINDER,
]
  .map(([remainder, kind]) => `dư ${remainder} là Kim lâu ${kind}`)
  .join(', ')}; các số dư khác không phạm Kim lâu.`;

export function kimLau(tuoi: number): KimLau | null {
  return KIM_LAU_BY_REMAINDER.get(tuoi % KIM_LAU_CYCLE) ?? null;
}
