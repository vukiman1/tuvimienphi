import { useQuery } from '@tanstack/react-query';
import { CircleCheck } from 'lucide-react';
import { formatNumber } from '@org/frontend-shared';
import type { CreditCheckout, RedeemGiftCodeResponse } from '@org/shared-contracts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { GiftCodeField } from '@/features/credits/components/gift-code-field';
import { TopUpCopyRow } from '@/features/credits/components/top-up-copy-row';
import { TopUpQr } from '@/features/credits/components/top-up-qr';
import { creditsQueries } from '@/features/credits/credits-queries';
import {
  TopUpStateKind,
  useTopUpState,
  type TopUpState,
} from '@/features/credits/use-top-up-state';
import { errorMessage } from '@/lib/api-error';

const CHECKOUT_ERROR_MESSAGE = 'Chưa mở được mã thanh toán, bạn thử lại sau nhé.';
const CURRENCY_SUFFIX = 'đ';
const OUT_OF_LUOT_TITLE = 'Bạn đã hết lượt miễn phí hôm nay';
const PAID_TITLE = 'Thanh toán thành công';
const GIFT_REDEEMED_TITLE = 'Nhập giftcode thành công';

interface TopUpDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onToppedUp: () => void;
}

interface TopUpPanelProps {
  readonly onToppedUp: () => void;
}

interface TopUpBodyProps {
  readonly topUpState: TopUpState;
  readonly checkout: CreditCheckout | undefined;
  readonly error: Error | null;
  readonly onGiftRedeemed: (response: RedeemGiftCodeResponse) => void;
  readonly onToppedUp: () => void;
}

interface TopUpHeading {
  readonly title: string;
  readonly description?: string;
}

interface TopUpWaitingProps {
  readonly checkout: CreditCheckout;
  readonly onGiftRedeemed: (response: RedeemGiftCodeResponse) => void;
}

interface TopUpSuccessProps {
  readonly onToppedUp: () => void;
}

function describeOffer(checkout: CreditCheckout | undefined): string | undefined {
  if (!checkout) return undefined;
  const amount = `${formatNumber(checkout.amountVnd)}${CURRENCY_SUFFIX}`;
  return `Chuyển khoản ${amount} để nhận thêm ${checkout.creditsPerPayment} lượt, dùng không giới hạn thời gian.`;
}

function headingFor(topUpState: TopUpState, checkout: CreditCheckout | undefined): TopUpHeading {
  switch (topUpState.kind) {
    case TopUpStateKind.Paid:
      return {
        title: PAID_TITLE,
        description: `Bạn có ${topUpState.chapterCredits} lượt, dùng không giới hạn thời gian.`,
      };
    case TopUpStateKind.GiftRedeemed:
      return {
        title: GIFT_REDEEMED_TITLE,
        description: `Đã cộng ${topUpState.creditsGranted} lượt. Bạn có ${topUpState.chapterCredits} lượt.`,
      };
    case TopUpStateKind.Waiting:
      return { title: OUT_OF_LUOT_TITLE, description: describeOffer(checkout) };
  }
}

function TopUpWaiting({ checkout, onGiftRedeemed }: TopUpWaitingProps) {
  return (
    <div className="flex flex-col gap-4">
      <TopUpQr qrImageUrl={checkout.qrImageUrl} />
      <div className="flex flex-col gap-3">
        <TopUpCopyRow label="Ngân hàng" value={checkout.bankCode} />
        <TopUpCopyRow label="Số tài khoản" value={checkout.accountNumber} />
        <TopUpCopyRow label="Chủ tài khoản" value={checkout.accountName} />
        <TopUpCopyRow label="Nội dung chuyển khoản" value={checkout.transferContent} />
      </div>
      <p className="font-body text-[14px] leading-[22px] text-[#6b6152]">
        Hệ thống tự cộng lượt sau khi nhận được tiền, thường trong vòng 1 phút.
      </p>
      <GiftCodeField onRedeemed={onGiftRedeemed} />
    </div>
  );
}

function TopUpSuccess({ onToppedUp }: TopUpSuccessProps) {
  return (
    <div className="flex flex-col items-center gap-5 py-4 text-center">
      <CircleCheck aria-hidden className="size-[56px] text-[#a8281c]" strokeWidth={1.5} />
      <button
        className="rounded-full bg-[#a8281c] px-7 py-[10px] font-body text-[16px] leading-[24px] font-semibold text-[#f5e8d0] transition-colors outline-none hover:bg-[#8f2016] focus-visible:ring-2 focus-visible:ring-[#a8281c] focus-visible:ring-offset-2"
        onClick={onToppedUp}
        type="button"
      >
        Xem luận giải
      </button>
    </div>
  );
}

function TopUpPanel({ onToppedUp }: TopUpPanelProps) {
  const { topUpState, markGiftRedeemed } = useTopUpState();
  const { data: checkout, error } = useQuery(creditsQueries.checkout());
  const heading = headingFor(topUpState, checkout);

  return (
    <>
      <DialogHeader>
        <DialogTitle>{heading.title}</DialogTitle>
        {heading.description ? <DialogDescription>{heading.description}</DialogDescription> : null}
      </DialogHeader>
      <TopUpBody
        checkout={checkout}
        error={error}
        onGiftRedeemed={markGiftRedeemed}
        onToppedUp={onToppedUp}
        topUpState={topUpState}
      />
    </>
  );
}

function TopUpBody({ topUpState, checkout, error, onGiftRedeemed, onToppedUp }: TopUpBodyProps) {
  if (topUpState.kind !== TopUpStateKind.Waiting) {
    return <TopUpSuccess onToppedUp={onToppedUp} />;
  }
  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <p className="font-body text-[15px] leading-[24px] text-[#a8281c]">
          {errorMessage(error, CHECKOUT_ERROR_MESSAGE)}
        </p>
        <GiftCodeField onRedeemed={onGiftRedeemed} />
      </div>
    );
  }
  if (!checkout) return null;
  return <TopUpWaiting checkout={checkout} onGiftRedeemed={onGiftRedeemed} />;
}

export function TopUpDialog({ open, onOpenChange, onToppedUp }: TopUpDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <TopUpPanel onToppedUp={onToppedUp} />
      </DialogContent>
    </Dialog>
  );
}
