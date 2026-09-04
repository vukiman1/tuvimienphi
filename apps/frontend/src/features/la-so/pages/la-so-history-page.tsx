import { Link } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { MEDIA } from '@/config/media';
import { HistoryList } from '@/features/la-so/history/components/history-list';
import { GoldWave, TitleFlourish } from '@/features/la-so/history/components/history-ornaments';

/** Chỉ liệt kê lá số đã xem. Form nhập nằm ở hero trang chủ, nên lập lá số mới là quay về đó. */

/**
 * Hai mảng tranh chạy ra sát mép màn hình, thoát khỏi lề của `main` — vốn canh giữa và có padding,
 * nên `left-0` chỉ tới mép khung chứ không tới mép màn hình. Phần thừa do `100vw` tính cả thanh
 * cuộn được `overflow-x: clip` ở layout `_site` cắt đi.
 */
const FULL_BLEED = { left: 'calc(50% - 50vw)', width: '100vw' } as const;

/** Nhạt dần về phía giữa để tranh không tranh chấp với chữ và với thẻ. */
const FADE_INWARD = {
  left: { maskImage: 'linear-gradient(to right, black 15%, transparent 75%)' },
  right: { maskImage: 'linear-gradient(to left, black 15%, transparent 75%)' },
} as const;

const PARCHMENT = { backgroundColor: '#faf4e8' } as const;

export function LaSoHistoryPage() {
  return (
    <main className="relative isolate overflow-hidden py-12 md:py-16" style={PARCHMENT}>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 -z-10" style={FULL_BLEED}>
        <img
          alt=""
          className="absolute top-0 left-0 hidden h-auto w-[20rem] opacity-45 md:block xl:w-[24rem]"
          src={MEDIA.laSo.historyCraneSun}
          style={FADE_INWARD.left}
        />
        <img
          alt=""
          className="absolute right-0 bottom-0 hidden h-auto w-[20rem] opacity-45 md:block xl:w-[24rem]"
          src={MEDIA.laSo.historyPavilionPine}
          style={FADE_INWARD.right}
        />
      </div>

      <div className="mx-auto w-full max-w-[1080px] px-4 md:px-8">
        <header className="text-center">
          <div className="flex items-center justify-center gap-4">
            <TitleFlourish facing="left" />
            <h1 className="font-display text-4xl font-bold text-[#7b2118] md:text-5xl">
              Lá số đã xem
            </h1>
            <TitleFlourish facing="right" />
          </div>
          <p className="mx-auto mt-3 max-w-[46ch] text-sm text-[#6b5b48]">
            Những lá số bạn đã lập hoặc mở gần đây.
          </p>

          <Link
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[#c9a15c]/60 bg-[#8c2b1e] px-6 py-3 font-display text-lg font-semibold text-[#fdf6e9] shadow-lg transition-colors hover:bg-[#7b2118] focus-visible:ring-2 focus-visible:ring-[#c9a15c] focus-visible:ring-offset-2 focus-visible:outline-none"
            to="/"
          >
            <Plus className="size-5" />
            Lập lá số mới
          </Link>
        </header>

        <HistoryList />
      </div>

      <footer className="mx-auto mt-16 w-full max-w-[1080px] px-4 md:px-8">
        <GoldWave />
        <div className="mt-2 flex items-center justify-center gap-3">
          <img alt="" aria-hidden className="size-6 object-contain" src={MEDIA.laSo.taiji} />
          <p className="font-display text-sm tracking-[0.25em] text-[#8a7256]">
            THIÊN THỜI · ĐỊA LỢI · NHÂN HÒA
          </p>
        </div>
      </footer>
    </main>
  );
}
