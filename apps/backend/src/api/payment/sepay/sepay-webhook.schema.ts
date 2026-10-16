import { z } from 'zod';
import { InvalidSepayPayloadError } from '../payment.errors';
import { SEPAY_TRANSACTION_DATE_PATTERN } from './sepay-transaction-date';

const sepayWebhookSchema = z
  .object({
    id: z.number().int(),
    transferType: z.string(),
    transferAmount: z.number().int(),
    content: z.string(),
    referenceCode: z.string(),
    transactionDate: z.string().regex(SEPAY_TRANSACTION_DATE_PATTERN),
  })
  .loose();

export interface SepayTransaction {
  readonly id: number;
  readonly transferType: string;
  readonly transferAmount: number;
  readonly content: string;
  readonly referenceCode: string;
  readonly transactionDate: string;
}

export function parseSepayWebhook(body: unknown): SepayTransaction {
  const result = sepayWebhookSchema.safeParse(body);
  if (!result.success) {
    throw new InvalidSepayPayloadError(
      result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; '),
    );
  }
  const { id, transferType, transferAmount, content, referenceCode, transactionDate } = result.data;
  return { id, transferType, transferAmount, content, referenceCode, transactionDate };
}
