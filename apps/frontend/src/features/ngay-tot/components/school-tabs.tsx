import type { ReactElement } from 'react';
import { FOCUS_RING_CLASS } from '@/design-system';
import { cn } from '@/lib/utils';

export const PAGE_TABS = [
  { id: 'hiep-ky', label: 'Hiệp Kỷ' },
  { id: 'phi-tinh', label: 'Phi Tinh' },
  { id: 'nhi-thap-bat-tu', label: 'Nhị Thập Bát Tú' },
] as const;

export type PageTabId = (typeof PAGE_TABS)[number]['id'];

interface SchoolTabsProps {
  readonly activeTab: PageTabId;
  readonly onSelect: (tab: PageTabId) => void;
}

export function SchoolTabs({ activeTab, onSelect }: SchoolTabsProps): ReactElement {
  return (
    <div aria-label="Trường phái luận giải" className="flex flex-wrap gap-2" role="tablist">
      {PAGE_TABS.map((tab) => (
        <button
          key={tab.id}
          aria-controls={`panel-${tab.id}`}
          aria-selected={activeTab === tab.id}
          id={`tab-${tab.id}`}
          onClick={() => onSelect(tab.id)}
          role="tab"
          type="button"
          className={cn(
            'min-h-11 rounded-full border px-5 text-sm font-semibold whitespace-nowrap transition-colors',
            FOCUS_RING_CLASS,
            activeTab === tab.id
              ? 'border-transparent bg-gold text-ink'
              : 'border-day/30 text-day hover:border-gold',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
