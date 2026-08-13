import { useState } from 'react';
import { DayDetailCard } from '@/features/ngay-tot/components/day-detail-card';
import { HourQualityList } from '@/features/ngay-tot/components/hour-quality-list';
import { MonthCalendar } from '@/features/ngay-tot/components/month-calendar';
import { NhiThapBatTuPanel } from '@/features/ngay-tot/components/nhi-thap-bat-tu-panel';
import { PhiTinhBoards } from '@/features/ngay-tot/components/phi-tinh-boards';
import { XuatHanhHours } from '@/features/ngay-tot/components/xuat-hanh-hours';
import {
  HOUR_QUALITY_PLACEHOLDER,
  NHI_THAP_BAT_TU_PILLARS_PLACEHOLDER,
  NHI_THAP_BAT_TU_VERSES_PLACEHOLDER,
} from '@/features/ngay-tot/placeholder-data';
import { getGioXuatHanh } from '@/lib/gio-xuat-hanh';
import { convertSolarToLunar } from '@/lib/lunar-calendar';
import { getPhiTinhBoards } from '@/lib/phi-tinh';

const PAGE_TABS = [
  { id: 'hiep-ky', label: 'Hiệp Kỷ' },
  { id: 'phi-tinh', label: 'Phi Tinh' },
  { id: 'nhi-thap-bat-tu', label: 'Nhị Thập Bát Tú' },
] as const;

type PageTabId = (typeof PAGE_TABS)[number]['id'];

export function NgayTotPage() {
  const [activeTab, setActiveTab] = useState<PageTabId>('hiep-ky');
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [viewYear, setViewYear] = useState(() => selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => selectedDate.getMonth() + 1);

  const stepMonth = (delta: -1 | 1) => {
    const next = new Date(viewYear, viewMonth - 1 + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth() + 1);
  };

  const goToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth() + 1);
  };

  const selectDate = (date: Date) => {
    setSelectedDate(date);
    setViewYear(date.getFullYear());
    setViewMonth(date.getMonth() + 1);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <h1 className="font-display text-3xl font-bold text-foreground">Ngày Tốt</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Xem lịch âm dương trong tháng, ngày mùng 1 và ngày rằm.
      </p>

      <div
        aria-label="Trường phái luận giải"
        className="mt-4 flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-[#c9a15c]/30 bg-card p-1 shadow-sm"
        role="tablist"
      >
        {PAGE_TABS.map((tab) => (
          <button
            key={tab.id}
            aria-controls={`panel-${tab.id}`}
            aria-selected={activeTab === tab.id}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            type="button"
            className={`rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/60 ${
              activeTab === tab.id
                ? 'bg-gradient-to-br from-[#e8c987] to-[#b8894a] text-[#1a1a1c] shadow-sm'
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        aria-labelledby={`tab-${activeTab}`}
        className="mt-4"
        id={`panel-${activeTab}`}
        role="tabpanel"
      >
        {activeTab === 'hiep-ky' ? (
          <>
            <div className="grid items-start gap-4 md:grid-cols-[minmax(0,400px)_1fr]">
              <MonthCalendar
                onGoToday={goToday}
                onSelectDate={selectDate}
                onStepMonth={stepMonth}
                selectedDate={selectedDate}
                viewMonth={viewMonth}
                viewYear={viewYear}
              />
              <div className="flex flex-col gap-4">
                <DayDetailCard date={selectedDate} />
                <XuatHanhHours slots={getGioXuatHanh(convertSolarToLunar(selectedDate))} />
              </div>
            </div>

            <div className="mt-4">
              <HourQualityList
                items={HOUR_QUALITY_PLACEHOLDER}
                isToday={selectedDate.toDateString() === new Date().toDateString()}
              />
            </div>
          </>
        ) : activeTab === 'phi-tinh' ? (
          <PhiTinhBoards boards={getPhiTinhBoards(selectedDate, new Date().getHours())} />
        ) : (
          <NhiThapBatTuPanel
            pillars={NHI_THAP_BAT_TU_PILLARS_PLACEHOLDER}
            verses={NHI_THAP_BAT_TU_VERSES_PLACEHOLDER}
          />
        )}
      </div>
    </main>
  );
}
