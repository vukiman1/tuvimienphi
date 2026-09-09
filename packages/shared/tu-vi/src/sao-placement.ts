import type { SaoName } from './sao-names.js';

/** Một sao và cung nó toạ thủ. Mọi hàm an sao đều trả về hình dạng này. */
export interface SaoPlacement<N extends SaoName = SaoName> {
  readonly name: N;
  readonly chiIndex: number;
}
