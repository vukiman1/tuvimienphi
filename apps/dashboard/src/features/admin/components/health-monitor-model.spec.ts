import { describe, expect, it } from 'vitest';
import type { AiHealthView } from '../data/admin-ai.query';
import {
  HEALTH_INTERVAL_MS,
  MAX_HEALTH_SAMPLES,
  firstDueAt,
  freshSamples,
  monitorView,
  nextCheckLabel,
  withSample,
} from './health-monitor-model';

const CHECKED_AT = '2026-10-08T04:00:00.000Z';
const CHECKED = Date.parse(CHECKED_AT);

const OK: AiHealthView = {
  status: 'OK',
  checkedAt: CHECKED_AT,
  latencyMs: 840,
  model: 'claude-opus-5-5',
  error: null,
};

const FAILED: AiHealthView = {
  status: 'FAILED',
  checkedAt: CHECKED_AT,
  latencyMs: 20_004,
  model: null,
  error: 'no model accepted the request — gemini-3.8-flash: This operation was aborted',
};

describe('firstDueAt', () => {
  it('calls straight away when nothing was checked, or the last check is old', () => {
    expect(firstDueAt(null, CHECKED)).toBe(CHECKED);
    expect(firstDueAt(OK, CHECKED + HEALTH_INTERVAL_MS + 1)).toBe(CHECKED + HEALTH_INTERVAL_MS + 1);
  });

  it('waits out the rest of the minute after a check that just ran', () => {
    expect(firstDueAt(OK, CHECKED + 10_000)).toBe(CHECKED + HEALTH_INTERVAL_MS);
  });
});

describe('freshSamples', () => {
  it('starts the bar with the last check only while it is still current', () => {
    expect(freshSamples(OK, CHECKED + 10_000)).toEqual([OK]);
    expect(freshSamples(OK, CHECKED + HEALTH_INTERVAL_MS + 1)).toEqual([]);
    expect(freshSamples(null, CHECKED)).toEqual([]);
  });
});

describe('withSample', () => {
  it('keeps the newest calls and lets the oldest fall off the bar', () => {
    const full = Array.from({ length: MAX_HEALTH_SAMPLES }, (_unused, index) => ({
      ...OK,
      checkedAt: new Date(CHECKED + index).toISOString(),
    }));

    const next = withSample(full, FAILED);

    expect(next).toHaveLength(MAX_HEALTH_SAMPLES);
    expect(next[next.length - 1]).toBe(FAILED);
    expect(next[0]).toBe(full[1]);
  });
});

describe('monitorView', () => {
  const base = { provider: 'ANTHROPIC' as const, isWatchable: true, requestError: null };

  it('explains why nothing is watched before a key and a model are saved', () => {
    const view = monitorView({ ...base, isWatchable: false, latest: null });

    expect(view.badge).toBe('default');
    expect(view.headline).toBe('Chưa theo dõi');
  });

  it('shows the first call as in progress', () => {
    expect(monitorView({ ...base, latest: null }).badge).toBe('processing');
  });

  it('says which model answered and how fast', () => {
    const view = monitorView({ ...base, latest: OK });

    expect(view.badge).toBe('success');
    expect(view.detail).toMatch(/^Claude Opus 5\.5 trả lời sau 840 ms, lúc /);
  });

  it('puts a failure in plain words and keeps the provider’s own message', () => {
    const view = monitorView({ ...base, latest: FAILED });

    expect(view.badge).toBe('error');
    expect(view.headline).toBe('Không trả lời được');
    expect(view.detail).toContain('không trả lời trong thời gian chờ');
    expect(view.raw).toBe(FAILED.error);
  });

  it('tells a call that never reached the AI from an AI that failed', () => {
    const view = monitorView({ ...base, latest: OK, requestError: 'Máy chủ chưa trả lời.' });

    expect(view.badge).toBe('warning');
    expect(view.detail).toBe('Máy chủ chưa trả lời.');
  });
});

describe('nextCheckLabel', () => {
  const clock = { isWatchable: true, isOn: true, isChecking: false, dueAt: 60_000, now: 18_400 };

  it('counts down to the next call', () => {
    expect(nextCheckLabel(clock)).toBe('Gọi lại sau 42 giây');
    expect(nextCheckLabel({ ...clock, now: 61_000 })).toBe('Gọi lại sau 0 giây');
    expect(nextCheckLabel({ ...clock, now: -900 })).toBe('Gọi lại sau 60 giây');
  });

  it('says so while a call is running or the watch is paused', () => {
    expect(nextCheckLabel({ ...clock, isChecking: true })).toBe('Đang gọi thử…');
    expect(nextCheckLabel({ ...clock, isOn: false })).toBe('Đã tạm dừng');
  });

  it('says nothing when there is nothing to watch', () => {
    expect(nextCheckLabel({ ...clock, isWatchable: false })).toBeNull();
  });
});
