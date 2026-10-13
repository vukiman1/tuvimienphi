export const MAX_REASON_LENGTH = 300;

interface ProviderErrorBody {
  readonly error?: { readonly message?: unknown } | null;
  readonly message?: unknown;
}

export function readableReason(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return (insideJsonBody(message) ?? message).slice(0, MAX_REASON_LENGTH);
}

function insideJsonBody(message: string): string | null {
  const start = message.indexOf('{');
  if (start < 0) {
    return null;
  }
  try {
    const body = JSON.parse(message.slice(start)) as ProviderErrorBody;
    const inner = body.error?.message ?? body.message;
    return typeof inner === 'string' ? `${message.slice(0, start)}${inner}` : null;
  } catch {
    return null;
  }
}
