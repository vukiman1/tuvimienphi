import type { AiCallView } from '../data/admin-ai.query';
import { friendlyFailure } from './ai-provider-model';

export interface CallOutcome {
  readonly color: 'green' | 'red' | 'gold';
  readonly text: string;
}

export const CALLS_PAGE_SIZE = 20;

const CHAPTER_LABEL = /^luan-giai:(.+)$/;

export function callOutcome(call: Pick<AiCallView, 'status' | 'isQuotaHit'>): CallOutcome {
  if (call.status === 'OK') {
    return { color: 'green', text: 'Thành công' };
  }
  return call.isQuotaHit ? { color: 'gold', text: 'Hết hạn mức' } : { color: 'red', text: 'Lỗi' };
}

export function callSubject(label: string | null | undefined): string | null {
  if (!label) {
    return null;
  }
  const chapter = CHAPTER_LABEL.exec(label);
  return chapter ? `Luận giải chương ${chapter[1]}` : label;
}

export function callNote(call: Pick<AiCallView, 'status' | 'error' | 'label'>): string | null {
  const subject = callSubject(call.label);
  if (call.status === 'OK') {
    return subject;
  }
  const reason = friendlyFailure(call.error ?? null);
  return subject ? `${subject}: ${reason}` : reason;
}
