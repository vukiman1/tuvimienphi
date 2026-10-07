import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { VanHanDetail, VanHanDetailLoader } from '@/features/van-han/components/van-han-detail';
import { ZodiacPicker } from '@/features/van-han/components/zodiac-picker';
import { resolveVanHanView } from '@/features/van-han/van-han-view';
import { getYearCanChi } from '@org/shared-tu-vi';
import { ZODIAC_CHI, type ZodiacChi } from '@/lib/zodiac-icons';
import { vanHanQueries } from '@/services/van-han-service';

const CHI_YEAR_OFFSET = 4;

function chiOfYear(year: number): ZodiacChi {
  return ZODIAC_CHI[(year - CHI_YEAR_OFFSET) % 12].chi;
}

/** Thời gian hiển thị loader (la bàn xoay) khi chuyển tuổi — đủ để cảm nhận "luận giải". */
const SWITCH_LOADING_MS = 600;

export function VanHanPage() {
  const [selectedChi, setSelectedChi] = useState<ZodiacChi>(() =>
    chiOfYear(new Date().getFullYear()),
  );
  const [isSwitching, setIsSwitching] = useState(true);

  const { data: current, isPending } = useQuery(vanHanQueries.current());
  const { year, fortune, isIllustrative } = resolveVanHanView(current, selectedChi);

  // Bật skeleton ngay khi người dùng chọn tuổi khác; effect bên dưới lo việc tắt.
  const handleSelectChi = (chi: ZodiacChi) => {
    if (chi === selectedChi) {
      return;
    }
    setSelectedChi(chi);
    setIsSwitching(true);
  };

  // Sau một nhịp ngắn thì tắt skeleton để nội dung mới trượt vào.
  useEffect(() => {
    const timer = setTimeout(() => setIsSwitching(false), SWITCH_LOADING_MS);
    return () => clearTimeout(timer);
  }, [selectedChi]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 font-body md:px-6">
      <h1 className="font-display text-3xl font-bold text-foreground">Vận Hạn</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Chọn con giáp để xem sao chiếu mệnh và vận hạn năm {getYearCanChi(year)} {year} theo tuổi.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <ZodiacPicker onSelect={handleSelectChi} selectedChi={selectedChi} />
        {isSwitching || isPending ? (
          <VanHanDetailLoader />
        ) : (
          <div key={selectedChi}>
            <VanHanDetail
              chi={selectedChi}
              currentYear={year}
              fortune={fortune}
              isIllustrative={isIllustrative}
            />
          </div>
        )}
      </div>
    </main>
  );
}
