import { findPaymentCode, generatePaymentCode, transferContentFor } from './payment-code';

const SAMPLE_COUNT = 200;
const UNAMBIGUOUS_CODE_PATTERN = /^[A-HJ-NP-Z2-9]{8}$/;

describe('payment code', () => {
  it('generates codes only from the unambiguous alphabet', () => {
    for (let index = 0; index < SAMPLE_COUNT; index += 1) {
      expect(generatePaymentCode()).toMatch(UNAMBIGUOUS_CODE_PATTERN);
    }
  });

  it('builds transfer content that findPaymentCode reads back', () => {
    const code = generatePaymentCode();

    expect(findPaymentCode(transferContentFor(code))).toBe(code);
  });

  it('finds the code inside bank-mangled content', () => {
    expect(findPaymentCode('ck tvmpab23cd45 nguyen van a')).toBe('AB23CD45');
    expect(findPaymentCode('MBVCB.123 TVMP AB23CD45 chuyen tien')).toBe('AB23CD45');
  });

  it('returns null when no prefix is present', () => {
    expect(findPaymentCode('chuyen tien AB23CD45')).toBeNull();
  });
});
