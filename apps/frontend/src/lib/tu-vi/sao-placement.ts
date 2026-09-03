import type { SaoName } from '@/lib/tu-vi/sao-names';

/** Một sao và cung nó toạ thủ. Mọi hàm an sao đều trả về hình dạng này. */
export interface SaoPlacement<N extends SaoName = SaoName> {
  readonly name: N;
  readonly chiIndex: number;
}
