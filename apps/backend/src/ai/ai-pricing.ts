export interface ModelPrice {
  readonly since?: string;
  readonly inputUsdPerMTok: number;
  readonly outputUsdPerMTok: number;
}

export const AI_PRICES_CHECKED_ON = '2026-10-07';

const TOKENS_PER_MTOK = 1_000_000;
const USD_DECIMALS = 6;
const DATED_SUFFIX = /-\d{8}$/;

const GEMINI_FLASH: readonly ModelPrice[] = [
  { inputUsdPerMTok: 0.75, outputUsdPerMTok: 3.75 },
  { since: '2027-01-01', inputUsdPerMTok: 1.5, outputUsdPerMTok: 7.5 },
];

const PRICES: Readonly<Record<string, readonly ModelPrice[]>> = {
  'gemini-3.8-flash': GEMINI_FLASH,
  'gemini-3.7-flash': GEMINI_FLASH,
  'gemini-3.6-flash': GEMINI_FLASH,
  'gemini-3.5-flash': [{ inputUsdPerMTok: 1.5, outputUsdPerMTok: 9 }],
  'gemini-3.5-flash-lite': [{ inputUsdPerMTok: 0.3, outputUsdPerMTok: 2.5 }],
  'gemini-3.1-flash-lite': [{ inputUsdPerMTok: 0.25, outputUsdPerMTok: 1.5 }],
  'gemini-3.1-pro-preview': [{ inputUsdPerMTok: 2, outputUsdPerMTok: 12 }],
  'gpt-6.1-sol': [{ inputUsdPerMTok: 2, outputUsdPerMTok: 10 }],
  'gpt-6-astra': [{ inputUsdPerMTok: 10, outputUsdPerMTok: 50 }],
  'gpt-6-luna': [{ inputUsdPerMTok: 0.1, outputUsdPerMTok: 0.5 }],
  'claude-opus-5-5': [{ inputUsdPerMTok: 4, outputUsdPerMTok: 20 }],
  'claude-fable-5-1': [{ inputUsdPerMTok: 10, outputUsdPerMTok: 50 }],
  'claude-sonnet-5-5': [{ inputUsdPerMTok: 2, outputUsdPerMTok: 10 }],
  'claude-haiku-4-5': [{ inputUsdPerMTok: 1, outputUsdPerMTok: 5 }],
};

export function priceOf(model: string, day: string): ModelPrice | null {
  const tiers = PRICES[model] ?? PRICES[model.replace(DATED_SUFFIX, '')];
  if (!tiers) {
    return null;
  }
  return tiers.reduce<ModelPrice | null>(
    (current, tier) => (!tier.since || tier.since <= day ? tier : current),
    null,
  );
}

export function costUsd(
  model: string,
  day: string,
  inputTokens: number,
  outputTokens: number,
): number | null {
  const price = priceOf(model, day);
  if (!price) {
    return null;
  }
  const cost =
    (inputTokens * price.inputUsdPerMTok + outputTokens * price.outputUsdPerMTok) / TOKENS_PER_MTOK;
  return Number(cost.toFixed(USD_DECIMALS));
}
