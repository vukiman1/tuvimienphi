import { useQuery } from '@tanstack/react-query';
import { formatNumber } from '@org/frontend-shared';
import type { CreditCheckout } from '@org/shared-contracts';
import { TitledDialog } from '@/components/ui/titled-dialog';
import { TopUpCopyRow } from '@/features/credits/components/top-up-copy-row';
import { TopUpQr } from '@/features/credits/components/top-up-qr';
import { creditsQueries } from '@/features/credits/credits-queries';
import { TopUpStateKind, useTopUpState } from '@/features/credits/use-top-up-state';
import { errorMessage } from '@/lib/api-error';

const CHECKOUT_ERROR_MESSAGE = 'Chưa mở được mã thanh toán, bạn thử lại sau nhé.';
const CURRENCY_SUFFIX = 'đ';

interface TopUpDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onToppedUp: () => void;
}

interface TopUpBodyProps {
  readonly onToppedUp: () => void;
}

interface TopUpWaitingProps {
  readonly checkout: CreditCheckout;
}

interface TopUpPaidProps {
  readonly chapterCredits: number;
  readonly onToppedUp: () => void;
}

function describeOffer(checkout: CreditCheckout | undefined): string | undefined {
  if (!checkout) return undefined;
  const amount = `${formatNumber(checkout.amountVnd)}${CURRENCY_SUFFIX}`;
  return `Chuyển khoản ${amount} để nhận thêm ${checkout.creditsPerPayment} lượt, dùng không giới hạn thời gian.`;
}

function TopUpWaiting({ checkout }: TopUpWaitingProps) {
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
    </div>
  );
}

function TopUpPaid({ chapterCredits, onToppedUp }: TopUpPaidProps) {
  return (
    <div className="flex flex-col items-center gap-5 py-4 text-center">
      <p className="font-body text-[16px] leading-[27px] text-[#6b6152]">
        Đã nhận! Bạn có {chapterCredits} lượt.
      </p>
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

function TopUpBody({ onToppedUp }: TopUpBodyProps) {
  const topUpState = useTopUpState();
  const { data: checkout, error } = useQuery(creditsQueries.checkout());

  if (topUpState.kind === TopUpStateKind.Paid) {
    return <TopUpPaid chapterCredits={topUpState.chapterCredits} onToppedUp={onToppedUp} />;
  }
  if (error) {
    return (
      <p className="font-body text-[15px] leading-[24px] text-[#a8281c]">
        {errorMessage(error, CHECKOUT_ERROR_MESSAGE)}
      </p>
    );
  }
  if (!checkout) return null;
  return <TopUpWaiting checkout={checkout} />;
}

export function TopUpDialog({ open, onOpenChange, onToppedUp }: TopUpDialogProps) {
  const { data: checkout } = useQuery({ ...creditsQueries.checkout(), enabled: open });

  return (
    <TitledDialog
      description={describeOffer(checkout)}
      onOpenChange={onOpenChange}
      open={open}
      title="Bạn đã hết lượt miễn phí hôm nay"
    >
      <TopUpBody onToppedUp={onToppedUp} />
    </TitledDialog>
  );
}
