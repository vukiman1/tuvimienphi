import type { ReactElement, ReactNode } from 'react';

interface TetHubChipProps {
  readonly children: ReactNode;
}

export function TetHubChip({ children }: TetHubChipProps): ReactElement {
  return (
    <span className="inline-flex items-center rounded-full border border-[#e0cfa5] bg-[#fdf3dc] px-2.5 py-0.5 text-[12px] font-medium text-[#6b4f1d]">
      {children}
    </span>
  );
}
