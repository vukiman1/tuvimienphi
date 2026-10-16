const VIETNAM_UTC_OFFSET = '+07:00';

export const SEPAY_TRANSACTION_DATE_PATTERN = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

export function parseSepayTransactionDate(transactionDate: string): Date {
  return new Date(`${transactionDate.replace(' ', 'T')}${VIETNAM_UTC_OFFSET}`);
}
