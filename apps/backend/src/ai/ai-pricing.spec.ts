import { costUsd, priceOf } from './ai-pricing';

describe('priceOf', () => {
  it('knows what a million tokens of a suggested model cost', () => {
    expect(priceOf('claude-opus-5-5', '2026-10-07')).toMatchObject({
      inputUsdPerMTok: 4,
      outputUsdPerMTok: 20,
    });
    expect(priceOf('gpt-6.1-sol', '2026-10-07')).toMatchObject({
      inputUsdPerMTok: 2,
      outputUsdPerMTok: 10,
    });
  });

  it('prices a dated snapshot like the model it is a snapshot of', () => {
    expect(priceOf('claude-haiku-4-5-20251001', '2026-10-07')).toMatchObject({
      inputUsdPerMTok: 1,
      outputUsdPerMTok: 5,
    });
  });

  it('follows the price Google announced for Flash from 2027', () => {
    expect(priceOf('gemini-3.8-flash', '2026-12-31')).toMatchObject({
      inputUsdPerMTok: 0.75,
      outputUsdPerMTok: 3.75,
    });
    expect(priceOf('gemini-3.8-flash', '2027-01-01')).toMatchObject({
      inputUsdPerMTok: 1.5,
      outputUsdPerMTok: 7.5,
    });
  });

  it('has no price for a model it was never told about', () => {
    expect(priceOf('gpt-9-nebula', '2026-10-07')).toBeNull();
  });
});

describe('costUsd', () => {
  it('charges input and output at their own rates', () => {
    expect(costUsd('claude-opus-5-5', '2026-10-07', 1_000_000, 100_000)).toBe(6);
    expect(costUsd('gemini-3.5-flash-lite', '2026-10-07', 12_000, 3_000)).toBe(0.0111);
  });

  it('keeps a tiny call from vanishing into rounding', () => {
    expect(costUsd('gpt-6-luna', '2026-10-07', 40, 6)).toBe(0.000007);
  });

  it('says it does not know rather than calling an unpriced model free', () => {
    expect(costUsd('gpt-9-nebula', '2026-10-07', 1_000, 1_000)).toBeNull();
  });
});
