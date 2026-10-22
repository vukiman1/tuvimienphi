import { UnrecoverableError } from 'bullmq';

export class EmailSendError extends Error {
  constructor(
    public readonly statusCode: number | null,
    cause: string,
    public readonly code: string | null,
  ) {
    super(`Resend rejected the email (${statusCode ?? 'no status'}): ${cause}`);
    this.name = 'EmailSendError';
  }
}

export class UnknownEmailKindError extends UnrecoverableError {
  constructor(job: unknown) {
    const kind =
      typeof job === 'object' && job !== null && 'kind' in job ? String(job.kind) : 'missing';
    super(`Unknown email job kind: ${kind}`);
    this.name = 'UnknownEmailKindError';
  }
}
