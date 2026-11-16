const ZALO_API_BASE = 'https://bot-api.zaloplatforms.com';
const ZALO_TIMEOUT_MS = 20_000;
const ZALO_MAX_MESSAGE_CHARS = 2000;
const ZALO_PARSE_MODE = 'markdown';

export interface ZaloCredentials {
  readonly botToken: string;
  readonly chatId: string;
}

export class ZaloSendError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ZaloSendError';
  }
}

export async function sendZaloMarkdown(credentials: ZaloCredentials, text: string): Promise<void> {
  const response = await fetch(`${ZALO_API_BASE}/bot${credentials.botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: credentials.chatId,
      text: text.slice(0, ZALO_MAX_MESSAGE_CHARS),
      parse_mode: ZALO_PARSE_MODE,
    }),
    signal: AbortSignal.timeout(ZALO_TIMEOUT_MS),
  });

  const body = await response.text();
  if (!response.ok || !isAcceptedByZalo(body)) {
    throw new ZaloSendError(`Zalo sendMessage failed with HTTP ${response.status}: ${body}`);
  }
}

function isAcceptedByZalo(body: string): boolean {
  try {
    const parsed: unknown = JSON.parse(body);
    return typeof parsed === 'object' && parsed !== null && 'ok' in parsed && parsed.ok === true;
  } catch {
    return false;
  }
}
