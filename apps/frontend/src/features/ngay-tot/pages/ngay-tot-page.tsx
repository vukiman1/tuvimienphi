import { useState } from 'react';
import { MEDIA } from '@/config/media';
import { DayDetailCard } from '@/features/ngay-tot/components/day-detail-card';
import { HourQualityList } from '@/features/ngay-tot/components/hour-quality-list';
import { MonthCalendar } from '@/features/ngay-tot/components/month-calendar';
import { NhiThapBatTuPanel } from '@/features/ngay-tot/components/nhi-thap-bat-tu-panel';
import { PhiTinhBoards } from '@/features/ngay-tot/components/phi-tinh-boards';
import { XuatHanhHours } from '@/features/ngay-tot/components/xuat-hanh-hours';
import { getGioHoangDao } from '@/lib/gio-hoang-dao';
import { getGioXuatHanh } from '@/lib/gio-xuat-hanh';
import { convertSolarToLunar } from '@/lib/lunar-calendar';
import { getNhiThapBatTu } from '@/lib/nhi-thap-bat-tu';
import { getPhiTinhBoards } from '@/lib/phi-tinh';

const PAGE_TABS = [
  { id: 'hiep-ky', label: 'Hiệp Kỷ' },
  { id: 'phi-tinh', label: 'Phi Tinh' },
  { id: 'nhi-thap-bat-tu', label: 'Nhị Thập Bát Tú' },
] as const;

type PageTabId = (typeof PAGE_TABS)[number]['id'];

/**
 * Two gradients intersected: the art dissolves before it reaches the heading on the left, and
 * again at the bottom and right so its rectangular edge never shows against the cream.
 */
const BACKDROP_FADE = [
  'linear-gradient(to right, transparent 0%, black 32%)',
  'linear-gradient(to bottom, black 45%, transparent 98%)',
  'linear-gradient(to left, transparent 0%, black 14%)',
].join(', ');

const BACKDROP_MASK = {
  maskImage: BACKDROP_FADE,
  maskComposite: 'intersect',
  WebkitMaskImage: BACKDROP_FADE,
  WebkitMaskComposite: 'source-in',
} as const;

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

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <main className="relative overflow-hidden bg-[#fdf9f0]">
      {/* Page backdrop: the cards sit over it, so everything after this needs its own stacking context. */}
      <img
        alt=""
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 w-[78%] max-w-[1080px] opacity-80 select-none"
        style={BACKDROP_MASK}
        src={MEDIA.ngayTot.sceneTop}
      />

      <div className="relative mx-auto w-full max-w-[1400px] px-4 py-10 md:px-8 md:py-14">
        {/* Header sits outside the grid so both cards start on the same line, as the design has it. */}
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
              Ngày Tốt
            </h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Xem lịch âm dương trong tháng, ngày mùng 1 và ngày rằm.
            </p>
          </div>

          <div aria-label="Trường phái luận giải" className="flex flex-wrap gap-2" role="tablist">
            {PAGE_TABS.map((tab) => (
              <button
                key={tab.id}
                aria-controls={`panel-${tab.id}`}
                aria-selected={activeTab === tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                type="button"
                className={`rounded-full border px-5 py-2 text-sm font-semibold whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/60 ${
                  activeTab === tab.id
                    ? 'border-transparent bg-gradient-to-br from-[#e8c987] to-[#b8894a] text-[#1a1a1c] shadow-sm'
                    : 'border-[#c9a15c]/40 bg-card text-muted-foreground hover:text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,560px)_minmax(0,1fr)]">
          {/* Outside the tab panel: every school still needs a date picked. */}
          <MonthCalendar
            onGoToday={goToday}
            onSelectDate={selectDate}
            onStepMonth={stepMonth}
            selectedDate={selectedDate}
            viewMonth={viewMonth}
            viewYear={viewYear}
          />

          <div
            aria-labelledby={`tab-${activeTab}`}
            className="flex min-w-0 flex-col gap-6"
            id={`panel-${activeTab}`}
            role="tabpanel"
          >
            {activeTab === 'hiep-ky' ? (
              <>
                <DayDetailCard date={selectedDate} />
                <XuatHanhHours slots={getGioXuatHanh(convertSolarToLunar(selectedDate))} />
              </>
            ) : activeTab === 'phi-tinh' ? (
              <PhiTinhBoards boards={getPhiTinhBoards(selectedDate, new Date().getHours())} />
            ) : (
              <NhiThapBatTuPanel {...getNhiThapBatTu(selectedDate, new Date().getHours())} />
            )}
          </div>
        </div>

        {activeTab === 'hiep-ky' && (
          <div className="mt-8">
            <HourQualityList items={getGioHoangDao(selectedDate)} isToday={isToday} />
          </div>
        )}
      </div>
    </main>
  );
}
