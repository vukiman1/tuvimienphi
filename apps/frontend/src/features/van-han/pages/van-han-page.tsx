import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { VanHanDetail } from '@/features/van-han/components/van-han-detail';
import { ZodiacPicker } from '@/features/van-han/components/zodiac-picker';
import { toVanHanFortune } from '@/features/van-han/map-van-han';
import { VAN_HAN_FORTUNE_BY_CHI } from '@/features/van-han/van-han-mock';
import { getYearCanChi } from '@/lib/lunar-calendar';
import { ZODIAC_CHI, type ZodiacChi } from '@/lib/zodiac-icons';
import { vanHanQueries } from '@/services/van-han-service';

const CHI_YEAR_OFFSET = 4;

function chiOfYear(year: number): ZodiacChi {
  return ZODIAC_CHI[(year - CHI_YEAR_OFFSET) % 12].chi;
}

function orderOfChi(chi: ZodiacChi): number {
  return ZODIAC_CHI.findIndex((entry) => entry.chi === chi) + 1;
}

export function VanHanPage() {
  const currentYear = new Date().getFullYear();
  const [selectedChi, setSelectedChi] = useState<ZodiacChi>(() => chiOfYear(currentYear));

  const { data: entries } = useQuery(vanHanQueries.byYear(currentYear));
  const entry = entries?.find((item) => item.zodiacOrder === orderOfChi(selectedChi));
  // Chưa có dữ liệu thật thì hiển thị nội dung minh họa riêng theo từng con giáp.
  const fortune = entry ? toVanHanFortune(entry) : VAN_HAN_FORTUNE_BY_CHI[selectedChi];

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 font-body md:px-6">
      <h1 className="font-display text-3xl font-bold text-foreground">Vận Hạn</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Chọn con giáp để xem sao chiếu mệnh và vận hạn năm {getYearCanChi(currentYear)}{' '}
        {currentYear} theo tuổi.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <ZodiacPicker onSelect={setSelectedChi} selectedChi={selectedChi} />
        <VanHanDetail chi={selectedChi} currentYear={currentYear} fortune={fortune} />
      </div>
    </main>
  );
}
