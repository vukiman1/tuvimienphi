import type { ApiErrorEnvelope, ApiErrorPayload } from '@org/shared-contracts';

/** Shown when the backend sends a failure envelope with no human-readable message. */
export const DEFAULT_ERROR_MESSAGE = 'Yêu cầu thất bại';

function extractMessage(errors: ApiErrorPayload, fallback: string): string {
  if (errors && typeof errors === 'object' && 'message' in errors) {
    const message = (errors as { message: unknown }).message;
    if (typeof message === 'string') return message;
  }
  const firstValue = Object.values(errors ?? {}).find((value) => typeof value === 'string');
  return typeof firstValue === 'string' ? firstValue : fallback;
}

/**
 * A failed request the backend described on purpose: it carries a status code and a payload of
 * field/message wording meant to be shown to the person who made the request.
 */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly errors: ApiErrorPayload;

  constructor(envelope: ApiErrorEnvelope, fallback: string = DEFAULT_ERROR_MESSAGE) {
    super(extractMessage(envelope.errors, fallback));
    this.name = 'ApiError';
    this.statusCode = envelope.statusCode;
    this.errors = envelope.errors;
  }
}

export function isApiErrorEnvelope(value: unknown): value is ApiErrorEnvelope {
  return (
    !!value &&
    typeof value === 'object' &&
    'success' in value &&
    (value as { success: unknown }).success === false &&
    'statusCode' in value &&
    'errors' in value
  );
}

/**
 * The message to show a person for a failed request. Only an ApiError carries wording the backend
 * meant for them; anything else is a crash or a network fault, whose message would be noise.
 */
export function errorMessage(caught: unknown, fallback: string): string {
  return caught instanceof ApiError ? caught.message : fallback;
}
