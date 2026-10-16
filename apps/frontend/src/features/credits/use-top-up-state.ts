import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { creditsQueries } from '@/features/credits/credits-queries';

export const PAYMENT_POLL_INTERVAL_MS = 3_000;

export enum TopUpStateKind {
  Waiting = 'waiting',
  Paid = 'paid',
}

export type TopUpState =
  | { readonly kind: TopUpStateKind.Waiting }
  | { readonly kind: TopUpStateKind.Paid; readonly chapterCredits: number };

const WAITING_STATE: TopUpState = { kind: TopUpStateKind.Waiting };

function hasCreditsRisen(
  credits: number | undefined,
  baselineCredits: number | undefined,
): credits is number {
  return credits !== undefined && baselineCredits !== undefined && credits > baselineCredits;
}

export function useTopUpState(): TopUpState {
  const [baselineCredits, setBaselineCredits] = useState<number | undefined>();

  const { data, isFetchedAfterMount } = useQuery({
    ...creditsQueries.summary(),
    refetchOnMount: 'always',
    refetchInterval: (query) =>
      hasCreditsRisen(query.state.data?.chapterCredits, baselineCredits)
        ? false
        : PAYMENT_POLL_INTERVAL_MS,
  });

  if (data && isFetchedAfterMount && baselineCredits === undefined) {
    setBaselineCredits(data.chapterCredits);
  }

  const credits = data?.chapterCredits;
  if (!hasCreditsRisen(credits, baselineCredits)) return WAITING_STATE;
  return { kind: TopUpStateKind.Paid, chapterCredits: credits };
}
