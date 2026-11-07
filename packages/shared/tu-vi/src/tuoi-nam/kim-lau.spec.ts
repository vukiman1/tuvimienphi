import { isKimLau } from '../dan-gian.js';
import { kimLau, KimLau } from './kim-lau.js';

describe('kimLau', () => {
  it.each([
    [37, KimLau.Than],
    [39, KimLau.The],
    [42, KimLau.Tu],
    [44, KimLau.LucSuc],
    [40, null],
  ])('names the kim lâu kind at tuổi %i', (tuoi, kind) => {
    expect(kimLau(tuoi)).toBe(kind);
  });

  it.each([1, 3, 6, 8, 10, 12, 15, 17, 20, 40])('agrees with isKimLau at tuổi %i', (tuoi) => {
    expect(kimLau(tuoi) !== null).toBe(isKimLau(tuoi));
  });
});
