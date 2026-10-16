export class InvalidSepayPayloadError extends Error {
  constructor(details: string) {
    super(`Invalid SePay webhook payload: ${details}`);
    this.name = 'InvalidSepayPayloadError';
  }
}

export class PaymentInsertResultError extends Error {
  constructor(sepayTransactionId: number) {
    super(`Unexpected insert result for SePay transaction ${sepayTransactionId}`);
    this.name = 'PaymentInsertResultError';
  }
}
