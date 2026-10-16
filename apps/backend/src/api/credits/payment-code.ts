import { randomInt } from 'node:crypto';

export const PAYMENT_CONTENT_PREFIX = 'TVMP';

const PAYMENT_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const PAYMENT_CODE_LENGTH = 8;
const NON_ALPHANUMERIC_PATTERN = /[^A-Z0-9]/g;
const PAYMENT_CONTENT_PATTERN = new RegExp(
  `${PAYMENT_CONTENT_PREFIX}([${PAYMENT_CODE_ALPHABET}]{${PAYMENT_CODE_LENGTH}})`,
);

export function generatePaymentCode(): string {
  return Array.from(
    { length: PAYMENT_CODE_LENGTH },
    () => PAYMENT_CODE_ALPHABET[randomInt(PAYMENT_CODE_ALPHABET.length)],
  ).join('');
}

export function transferContentFor(code: string): string {
  return `${PAYMENT_CONTENT_PREFIX}${code}`;
}

export function findPaymentCode(content: string): string | null {
  const normalized = content.toUpperCase().replace(NON_ALPHANUMERIC_PATTERN, '');
  return PAYMENT_CONTENT_PATTERN.exec(normalized)?.[1] ?? null;
}
