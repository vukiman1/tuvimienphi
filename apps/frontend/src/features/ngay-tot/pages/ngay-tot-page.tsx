import { useState, type ReactElement } from 'react';
import { Emphasis, PageHero } from '@/design-system';
import { DayDetailCard } from '@/features/ngay-tot/components/day-detail-card';
import { HourQualityList } from '@/features/ngay-tot/components/hour-quality-list';
import { MonthCalendar } from '@/features/ngay-tot/components/month-calendar';
import { NhiThapBatTuPanel } from '@/features/ngay-tot/components/nhi-thap-bat-tu-panel';
import { PhiTinhBoards } from '@/features/ngay-tot/components/phi-tinh-boards';
import { SchoolTabs, type PageTabId } from '@/features/ngay-tot/components/school-tabs';
import { XuatHanhHours } from '@/features/ngay-tot/components/xuat-hanh-hours';
import { getGioHoangDao } from '@/lib/gio-hoang-dao';
import { getGioXuatHanh } from '@/lib/gio-xuat-hanh';
import { convertSolarToLunar } from '@org/shared-tu-vi';
import { getNhiThapBatTu } from '@/lib/nhi-thap-bat-tu';
import { getPhiTinhBoards } from '@/lib/phi-tinh';

export function NgayTotPage(): ReactElement {
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
    <main className="w-full bg-day">
      <PageHero
        title={
          <>
            Ngày <Emphasis isAccent>Tốt</Emphasis>
          </>
        }
        lead="Xem lịch âm dương trong tháng, ngày mùng 1 và ngày rằm."
      >
        <SchoolTabs activeTab={activeTab} onSelect={setActiveTab} />
      </PageHero>

      <section className="bg-day">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
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
      </section>
    </main>
  );
}
