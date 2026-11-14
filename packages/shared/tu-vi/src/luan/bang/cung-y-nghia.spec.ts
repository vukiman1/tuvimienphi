import { CUNG_NAMES } from '../../dia-ban.js';
import { CUNG_Y_NGHIA } from './cung-y-nghia.js';

describe('CUNG_Y_NGHIA', () => {
  it('every cung has a one-line meaning', () => {
    expect(CUNG_NAMES.every((name) => CUNG_Y_NGHIA[name].length > 0)).toBe(true);
    expect(CUNG_NAMES.some((name) => CUNG_Y_NGHIA[name].includes('\n'))).toBe(false);
  });
});
