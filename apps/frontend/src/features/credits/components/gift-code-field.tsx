import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { GIFT_CODE_MAX_LENGTH, type RedeemGiftCodeResponse } from '@org/shared-contracts';
import { creditsQueries, redeemGiftCode } from '@/features/credits/credits-queries';
import { DEFAULT_ERROR_MESSAGE, errorMessage } from '@/lib/api-error';

interface GiftCodeFieldProps {
  readonly onRedeemed: (response: RedeemGiftCodeResponse) => void;
}

export function GiftCodeField({ onRedeemed }: GiftCodeFieldProps) {
  const queryClient = useQueryClient();
  const [code, setCode] = useState('');

  const redeemMutation = useMutation({
    mutationFn: redeemGiftCode,
    onSuccess: async (response) => {
      onRedeemed(response);
      await queryClient.invalidateQueries({ queryKey: creditsQueries.summary().queryKey });
    },
  });

  const trimmedCode = code.trim();
  const canSubmit = trimmedCode !== '' && !redeemMutation.isPending;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3 font-body text-[13px] leading-[20px] text-[#6b6152]">
        <span className="h-px flex-1 bg-[#6b6152]/25" />
        <span>Hoặc nhập giftcode</span>
        <span className="h-px flex-1 bg-[#6b6152]/25" />
      </div>
      <form
        className="flex items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (canSubmit) redeemMutation.mutate(trimmedCode);
        }}
      >
        <input
          aria-label="Giftcode"
          className="min-w-0 flex-1 rounded-full border border-[#6b6152]/30 bg-transparent px-4 py-[8px] font-body text-[15px] leading-[24px] text-[#3a2f1f] outline-none focus-visible:ring-2 focus-visible:ring-[#a8281c]"
          maxLength={GIFT_CODE_MAX_LENGTH}
          onChange={(event) => setCode(event.target.value)}
          value={code}
        />
        <button
          className="shrink-0 rounded-full bg-[#a8281c] px-5 py-[8px] font-body text-[15px] leading-[24px] font-semibold text-[#f5e8d0] transition-colors outline-none hover:bg-[#8f2016] focus-visible:ring-2 focus-visible:ring-[#a8281c] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canSubmit}
          type="submit"
        >
          Áp dụng
        </button>
      </form>
      {redeemMutation.error ? (
        <p className="font-body text-[15px] leading-[24px] text-[#a8281c]" role="alert">
          {errorMessage(redeemMutation.error, DEFAULT_ERROR_MESSAGE)}
        </p>
      ) : null}
    </div>
  );
}
