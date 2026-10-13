import { describe, expect, it } from 'vitest';
import { callNote, callOutcome, callSubject } from './ai-call-model';

describe('callOutcome', () => {
  it('tells a call that ran into a limit from one that simply failed', () => {
    expect(callOutcome({ status: 'OK', isQuotaHit: false }).text).toBe('Thành công');
    expect(callOutcome({ status: 'FAILED', isQuotaHit: false }).text).toBe('Lỗi');
    expect(callOutcome({ status: 'FAILED', isQuotaHit: true }).text).toBe('Hết hạn mức');
  });
});

describe('callSubject', () => {
  it('names the chapter a reading call was written for', () => {
    expect(callSubject('luan-giai:2')).toBe('Luận giải chương 2');
  });

  it('shows any other label as it is, and nothing when there is none', () => {
    expect(callSubject('thử nghiệm')).toBe('thử nghiệm');
    expect(callSubject(null)).toBeNull();
  });
});

describe('callNote', () => {
  it('says what a successful call was for', () => {
    expect(callNote({ status: 'OK', error: null, label: 'luan-giai:1' })).toBe(
      'Luận giải chương 1',
    );
    expect(callNote({ status: 'OK', error: null, label: null })).toBeNull();
  });

  it('adds why a failed call failed, in plain words', () => {
    expect(
      callNote({ status: 'FAILED', error: '429 RESOURCE_EXHAUSTED', label: 'luan-giai:1' }),
    ).toBe('Luận giải chương 1: Hết hạn mức hoặc đang bị giới hạn tốc độ.');
    expect(callNote({ status: 'FAILED', error: '401 invalid x-api-key', label: null })).toBe(
      'Khoá API không đúng hoặc đã bị thu hồi.',
    );
  });
});
