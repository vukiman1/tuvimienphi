import { useState } from 'react';
import { VanHanDetail } from '@/features/van-han/components/van-han-detail';
import { ZodiacPicker } from '@/features/van-han/components/zodiac-picker';
import { VAN_HAN_FORTUNE_PLACEHOLDER } from '@/features/van-han/placeholder-data';
import { getYearCanChi } from '@/lib/lunar-calendar';
import { ZODIAC_CHI, type ZodiacChi } from '@/lib/zodiac-icons';

const CHI_YEAR_OFFSET = 4;

function chiOfYear(year: number): ZodiacChi {
  return ZODIAC_CHI[(year - CHI_YEAR_OFFSET) % 12].chi;
}

export function VanHanPage() {
  const currentYear = new Date().getFullYear();
  const [selectedChi, setSelectedChi] = useState<ZodiacChi>(() => chiOfYear(currentYear));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <h1 className="font-display text-3xl font-bold text-foreground">Vận Hạn</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Chọn con giáp để xem sao chiếu mệnh và vận hạn năm {getYearCanChi(currentYear)}{' '}
        {currentYear} theo tuổi.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <ZodiacPicker onSelect={setSelectedChi} selectedChi={selectedChi} />
        <VanHanDetail
          chi={selectedChi}
          currentYear={currentYear}
          fortune={VAN_HAN_FORTUNE_PLACEHOLDER}
        />
      </div>
    </main>
  );
}
