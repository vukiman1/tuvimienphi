import { useEffect, useState } from 'react';
import { EMAIL_CODE_RESEND_COOLDOWN_SECONDS } from '@org/shared-contracts';

const TICK_MS = 1000;

export interface ResendCooldown {
  readonly secondsLeft: number;
  readonly canResend: boolean;
  readonly restart: () => void;
}

export function useResendCooldown(): ResendCooldown {
  const [secondsLeft, setSecondsLeft] = useState(EMAIL_CODE_RESEND_COOLDOWN_SECONDS);
  const isCoolingDown = secondsLeft > 0;

  useEffect(() => {
    if (!isCoolingDown) return;
    const timer = setInterval(() => setSecondsLeft((left) => Math.max(0, left - 1)), TICK_MS);
    return () => clearInterval(timer);
  }, [isCoolingDown]);

  return {
    secondsLeft,
    canResend: !isCoolingDown,
    restart: () => setSecondsLeft(EMAIL_CODE_RESEND_COOLDOWN_SECONDS),
  };
}
