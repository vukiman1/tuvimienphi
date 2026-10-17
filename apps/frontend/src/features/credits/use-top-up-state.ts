import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import type { RedeemGiftCodeResponse } from '@org/shared-contracts';
import { creditsQueries } from '@/features/credits/credits-queries';

export const PAYMENT_POLL_INTERVAL_MS = 3_000;

export enum TopUpStateKind {
  Waiting = 'waiting',
  Paid = 'paid',
  GiftRedeemed = 'gift-redeemed',
}

export type TopUpState =
  | { readonly kind: TopUpStateKind.Waiting }
  | { readonly kind: TopUpStateKind.Paid; readonly chapterCredits: number }
  | {
      readonly kind: TopUpStateKind.GiftRedeemed;
      readonly creditsGranted: number;
      readonly chapterCredits: number;
    };

interface TopUpController {
  readonly topUpState: TopUpState;
  readonly markGiftRedeemed: (response: RedeemGiftCodeResponse) => void;
}

const WAITING_STATE: TopUpState = { kind: TopUpStateKind.Waiting };

function hasCreditsRisen(
  credits: number | undefined,
  baselineCredits: number | undefined,
): credits is number {
  return credits !== undefined && baselineCredits !== undefined && credits > baselineCredits;
}

export function useTopUpState(): TopUpController {
  const [baselineCredits, setBaselineCredits] = useState<number | undefined>();
  const [giftRedemption, setGiftRedemption] = useState<RedeemGiftCodeResponse | undefined>();

  const { data, isFetchedAfterMount, isRefetchError } = useQuery({
    ...creditsQueries.summary(),
    refetchOnMount: 'always',
    refetchInterval: (query) =>
      giftRedemption || hasCreditsRisen(query.state.data?.chapterCredits, baselineCredits)
        ? false
        : PAYMENT_POLL_INTERVAL_MS,
  });

  if (data && isFetchedAfterMount && !isRefetchError && baselineCredits === undefined) {
    setBaselineCredits(data.chapterCredits);
  }

  const markGiftRedeemed = (response: RedeemGiftCodeResponse): void => setGiftRedemption(response);

  if (giftRedemption) {
    return {
      topUpState: { kind: TopUpStateKind.GiftRedeemed, ...giftRedemption },
      markGiftRedeemed,
    };
  }

  const credits = data?.chapterCredits;
  if (!hasCreditsRisen(credits, baselineCredits)) {
    return { topUpState: WAITING_STATE, markGiftRedeemed };
  }
  return { topUpState: { kind: TopUpStateKind.Paid, chapterCredits: credits }, markGiftRedeemed };
}
