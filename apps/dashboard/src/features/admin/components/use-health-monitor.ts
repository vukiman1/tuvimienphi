import { useEffect, useEffectEvent, useState, useSyncExternalStore } from 'react';
import { rejectionReason } from '@/lib/graphql-request';
import type { AiHealthView } from '../data/admin-ai.query';
import type { CheckResult } from './ai-provider-model';
import { HEALTH_INTERVAL_MS, firstDueAt, freshSamples, withSample } from './health-monitor-model';

const SECOND_MS = 1000;

export const SERVER_UNREACHABLE = 'Máy chủ chưa trả lời, thử lại sau ít phút.';

export interface HealthMonitorOptions {
  readonly initial: AiHealthView | null;
  readonly isEnabled: boolean;
  readonly onCheck: () => Promise<AiHealthView>;
}

export interface HealthMonitor {
  readonly samples: readonly AiHealthView[];
  readonly isChecking: boolean;
  readonly dueAt: number;
  readonly requestError: string | null;
  readonly checkNow: () => Promise<CheckResult>;
}

export function useHealthMonitor({
  initial,
  isEnabled,
  onCheck,
}: HealthMonitorOptions): HealthMonitor {
  const [samples, setSamples] = useState(() => freshSamples(initial, Date.now()));
  const [dueAt, setDueAt] = useState(() => firstDueAt(initial, Date.now()));
  const [isChecking, setIsChecking] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const checkNow = async (): Promise<CheckResult> => {
    setIsChecking(true);
    try {
      const health = await onCheck();
      setSamples((current) => withSample(current, health));
      setRequestError(null);
      return { health };
    } catch (caught) {
      const failure = rejectionReason(caught) ?? SERVER_UNREACHABLE;
      setRequestError(failure);
      return { failure };
    } finally {
      setIsChecking(false);
      setDueAt(Date.now() + HEALTH_INTERVAL_MS);
    }
  };
  const onDue = useEffectEvent(() => {
    void checkNow();
  });

  useEffect(() => {
    if (!isEnabled || isChecking) {
      return undefined;
    }
    const timer = setTimeout(onDue, Math.max(0, dueAt - Date.now()));
    return () => clearTimeout(timer);
  }, [isEnabled, isChecking, dueAt]);

  return { samples, isChecking, dueAt, requestError, checkNow };
}

export function useNow(isTicking: boolean): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isTicking) {
      return undefined;
    }
    const timer = setInterval(() => setNow(Date.now()), SECOND_MS);
    return () => clearInterval(timer);
  }, [isTicking]);

  return now;
}

function subscribeToVisibility(onChange: () => void): () => void {
  document.addEventListener('visibilitychange', onChange);
  return () => document.removeEventListener('visibilitychange', onChange);
}

export function usePageVisible(): boolean {
  return useSyncExternalStore(
    subscribeToVisibility,
    () => document.visibilityState === 'visible',
    () => true,
  );
}
