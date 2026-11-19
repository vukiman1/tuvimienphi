import { useState, type ReactElement } from 'react';
import { Emphasis, PageHero } from '@/design-system';
import { DayDetailCard } from '@/features/ngay-tot/components/day-detail-card';
import { HourQualityList } from '@/features/ngay-tot/components/hour-quality-list';
import { MonthCalendar } from '@/features/ngay-tot/components/month-calendar';
import { NhiThapBatTuPanel } from '@/features/ngay-tot/components/nhi-thap-bat-tu-panel';
import { PhiTinhBoards } from '@/features/ngay-tot/components/phi-tinh-boards';
import { SchoolTabs, type PageTabId } from '@/features/ngay-tot/components/school-tabs';
import { XuatHanhHours } from '@/features/ngay-tot/components/xuat-hanh-hours';
import { useNow } from '@/hooks/use-now';
import { getGioHoangDao } from '@/lib/gio-hoang-dao';
import { getGioXuatHanh } from '@/lib/gio-xuat-hanh';
import { convertSolarToLunar } from '@org/shared-tu-vi';
import { getNhiThapBatTu } from '@/lib/nhi-thap-bat-tu';
import { getPhiTinhBoards } from '@/lib/phi-tinh';

interface CalendarMonth {
  readonly year: number;
  readonly month: number;
}

function monthOf(date: Date): CalendarMonth {
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export function NgayTotPage(): ReactElement {
  const now = useNow();
  const [activeTab, setActiveTab] = useState<PageTabId>('hiep-ky');
  const [pickedDate, setPickedDate] = useState<Date | null>(null);
  const [steppedMonth, setSteppedMonth] = useState<CalendarMonth | null>(null);
  const selectedDate = pickedDate ?? now;
  const { year: viewYear, month: viewMonth } = steppedMonth ?? monthOf(selectedDate);

  const stepMonth = (delta: -1 | 1) => {
    setSteppedMonth(monthOf(new Date(viewYear, viewMonth - 1 + delta, 1)));
  };

  const goToday = () => {
    setPickedDate(null);
    setSteppedMonth(null);
  };

  const selectDate = (date: Date) => {
    setPickedDate(date);
    setSteppedMonth(null);
  };

  const isToday = selectedDate.toDateString() === now.toDateString();

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
                <PhiTinhBoards boards={getPhiTinhBoards(selectedDate, now.getHours())} />
              ) : (
                <NhiThapBatTuPanel {...getNhiThapBatTu(selectedDate, now.getHours())} />
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
