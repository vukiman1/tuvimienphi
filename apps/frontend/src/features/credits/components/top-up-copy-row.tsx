import { Check, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const COPIED_FEEDBACK_MS = 2_000;
const COPY_FAILED_MESSAGE = 'Không sao chép được, bạn hãy tự gõ.';

enum CopyState {
  Idle = 'idle',
  Copied = 'copied',
  Failed = 'failed',
}

interface TopUpCopyRowProps {
  readonly label: string;
  readonly value: string;
}

export function TopUpCopyRow({ label, value }: TopUpCopyRowProps) {
  const [copyState, setCopyState] = useState<CopyState>(CopyState.Idle);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    },
    [],
  );

  async function copyValue(): Promise<void> {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      setCopyState(CopyState.Failed);
      return;
    }
    setCopyState(CopyState.Copied);
    resetTimerRef.current = setTimeout(() => setCopyState(CopyState.Idle), COPIED_FEEDBACK_MS);
  }

  const Icon = copyState === CopyState.Copied ? Check : Copy;

  return (
    <div className="font-body text-[15px] leading-[24px]">
      <div className="flex items-center justify-between gap-3">
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
      {copyState === CopyState.Failed && (
        <p className="text-[13px] leading-[20px] text-[#a8281c]" role="alert">
          {COPY_FAILED_MESSAGE}
        </p>
      )}
    </div>
  );
}
