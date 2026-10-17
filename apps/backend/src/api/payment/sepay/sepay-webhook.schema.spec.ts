import { InvalidSepayPayloadError } from '../payment.errors';
import { parseSepayWebhook } from './sepay-webhook.schema';

const VALID_PAYLOAD = {
  id: 92704,
  transferType: 'in',
  transferAmount: 5000,
  content: 'TVMPABCD2345',
  referenceCode: 'FT26289',
  transactionDate: '2026-10-16 10:00:00',
};

describe('parseSepayWebhook', () => {
  it('accepts a payload carrying fields it does not know', () => {
    const transaction = parseSepayWebhook({ ...VALID_PAYLOAD, newField: 'x', code: null });
    expect(transaction).toEqual(VALID_PAYLOAD);
  });

  it('stores a transfer whose content is null as an unmatched payment without a code', () => {
    const transaction = parseSepayWebhook({ ...VALID_PAYLOAD, content: null });
    expect(transaction.content).toBe('');
  });

  it('accepts a transfer without a reference code', () => {
    const transaction = parseSepayWebhook({ ...VALID_PAYLOAD, referenceCode: undefined });
    expect(transaction.referenceCode).toBe('');
  });

  it('rejects a payload without an id', () => {
    expect(() => parseSepayWebhook({ ...VALID_PAYLOAD, id: undefined })).toThrow(
      InvalidSepayPayloadError,
    );
  });

  it('rejects a fractional transfer amount', () => {
    expect(() => parseSepayWebhook({ ...VALID_PAYLOAD, transferAmount: 5000.5 })).toThrow(
      InvalidSepayPayloadError,
    );
  });

  it('rejects a transaction date in an unexpected format', () => {
    expect(() => parseSepayWebhook({ ...VALID_PAYLOAD, transactionDate: '16/10/2026' })).toThrow(
      InvalidSepayPayloadError,
    );
  });

  it('rejects a body that is not an object', () => {
    expect(() => parseSepayWebhook(null)).toThrow(InvalidSepayPayloadError);
  });
});
