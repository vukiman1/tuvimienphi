import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

const COPIED_FEEDBACK_MS = 2_000;

interface TopUpCopyRowProps {
  readonly label: string;
  readonly value: string;
}

export function TopUpCopyRow({ label, value }: TopUpCopyRowProps) {
  const [isCopied, setIsCopied] = useState(false);

  async function copyValue(): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      return;
    }
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), COPIED_FEEDBACK_MS);
  }

  const Icon = isCopied ? Check : Copy;

  return (
    <div className="flex items-center justify-between gap-3 font-body text-[15px] leading-[24px]">
      <div className="min-w-0">
        <p className="text-[13px] leading-[20px] text-[#6b6152]">{label}</p>
        <p className="font-semibold break-words text-[#3a2f1f]">{value}</p>
      </div>
      <button
        aria-label={`Sao chép ${label.toLowerCase()}`}
        className="shrink-0 rounded-full p-2 text-[#a8281c] transition-colors outline-none hover:bg-[#a8281c]/10 focus-visible:ring-2 focus-visible:ring-[#a8281c]"
        onClick={() => void copyValue()}
        type="button"
      >
        <Icon aria-hidden className="size-[16px]" />
      </button>
    </div>
  );
}
