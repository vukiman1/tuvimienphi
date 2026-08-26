import { useState } from 'react';
import { MEDIA } from '@/config/media';
import { CUNG_SURFACE_CLASS } from '@/features/la-so/chart-colors';
import { LaSoBoard } from '@/features/la-so/components/la-so-board';
import { LuanGiaiSection } from '@/features/la-so/components/luan-giai-section';
import { MOCK_LUAN_GIAI } from '@/features/la-so/luan-giai-data';
import { MOCK_CHART } from '@/features/la-so/mock-chart';

/**
 * Dải trang trí chạy hết bề ngang màn hình, thoát khỏi lề của `main` — vốn được canh giữa và có
 * padding, nên `left-0` chỉ tới mép khung chứ không tới mép màn hình.
 *
 * `100vw` tính cả thanh cuộn dọc nên thừa vài pixel; phần thừa đó được `overflow-x: clip` ở gốc
 * layout `_site` cắt đi. Không cắt ở `main` được: `main` giới hạn 1400px nên sẽ xén mất hai bên tranh.
 */
const FULL_BLEED = { left: 'calc(50% - 50vw)', width: '100vw' } as const;

/** Tranh thuỷ mặc cao bằng địa bàn, nhạt dần về phía nó để không tranh chấp với chữ trong lá số. */
const DECOR_CLASS = 'pointer-events-none absolute inset-y-0 h-full w-auto opacity-40 select-none';

const FADE_TOWARD_BOARD = {
  left: { maskImage: 'linear-gradient(to right, black 40%, transparent 100%)' },
  right: { maskImage: 'linear-gradient(to left, black 40%, transparent 100%)' },
} as const;

export function LaSoPage() {
  const chart = MOCK_CHART;
  const menhIndex = chart.cungs.findIndex((cung) => cung.isMenh);
  const [selectedIndex, setSelectedIndex] = useState(menhIndex);
  const [activeChapter, setActiveChapter] = useState(MOCK_LUAN_GIAI.chapters[0].order);
  const selected = chart.cungs[selectedIndex];

  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 py-8 md:px-8 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-foreground">Lá Số Tử Vi</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {chart.meta.amDuong} · {chart.meta.banMenh}
          </p>
        </div>
        <p
          className={`rounded-full px-4 py-1.5 text-sm font-semibold text-[#5b5347] ${CUNG_SURFACE_CLASS.related}`}
        >
          {chart.meta.viewYear}
        </p>
      </div>

      <div className="relative mt-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 hidden overflow-hidden xl:block"
          style={FULL_BLEED}
        >
          <img
            alt=""
            className={`${DECOR_CLASS} left-0`}
            src={MEDIA.laSo.decorLeft}
            style={FADE_TOWARD_BOARD.left}
          />
          <img
            alt=""
            className={`${DECOR_CLASS} right-0`}
            src={MEDIA.laSo.decorRight}
            style={FADE_TOWARD_BOARD.right}
          />
        </div>

        {/* Sau hai ảnh trong DOM nên luôn vẽ đè lên chúng, kể cả khi khung hẹp và ảnh lấn vào. */}
        <div className="relative">
          <LaSoBoard chart={chart} onSelect={setSelectedIndex} selectedIndex={selectedIndex} />
        </div>
      </div>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Đang chọn cung <span className="font-semibold text-foreground">{selected.name}</span> ·{' '}
        {selected.canChi} · đại vận {selected.daiVanStartAge}–{selected.daiVanStartAge + 9} tuổi
      </p>

      <LuanGiaiSection
        activeChapter={activeChapter}
        luanGiai={MOCK_LUAN_GIAI}
        onSelectChapter={setActiveChapter}
      />
    </main>
  );
}
