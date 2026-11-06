import { act, renderHook } from '@testing-library/react';
import { EMAIL_CODE_RESEND_COOLDOWN_SECONDS } from '@org/shared-contracts';
import { useResendCooldown } from './use-resend-cooldown';

const MS_PER_SECOND = 1000;

function waitSeconds(seconds: number): void {
  act(() => jest.advanceTimersByTime(seconds * MS_PER_SECOND));
}

describe('useResendCooldown', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('makes the person wait a full minute after a code was sent', () => {
    const { result } = renderHook(() => useResendCooldown());

    expect(result.current.secondsLeft).toBe(EMAIL_CODE_RESEND_COOLDOWN_SECONDS);
    expect(result.current.canResend).toBe(false);
  });

  it('counts down one second at a time', () => {
    const { result } = renderHook(() => useResendCooldown());

    waitSeconds(15);

    expect(result.current.secondsLeft).toBe(EMAIL_CODE_RESEND_COOLDOWN_SECONDS - 15);
  });

  it('allows another code once the minute is up', () => {
    const { result } = renderHook(() => useResendCooldown());

    waitSeconds(EMAIL_CODE_RESEND_COOLDOWN_SECONDS);

    expect(result.current.secondsLeft).toBe(0);
    expect(result.current.canResend).toBe(true);
  });

  it('starts the wait again after another code is sent', () => {
    const { result } = renderHook(() => useResendCooldown());
    waitSeconds(EMAIL_CODE_RESEND_COOLDOWN_SECONDS);

    act(() => result.current.restart());

    expect(result.current.secondsLeft).toBe(EMAIL_CODE_RESEND_COOLDOWN_SECONDS);
    expect(result.current.canResend).toBe(false);
  });
});
