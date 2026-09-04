import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { HistoryList } from '@/features/la-so/history/components/history-list';

/** Chỉ liệt kê lá số đã xem. Form nhập nằm ở hero trang chủ, nên lập lá số mới là quay về đó. */
export function LaSoHistoryPage() {
  return (
    <main className="mx-auto w-full max-w-[880px] px-4 py-12 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-foreground">Lá số đã xem</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Những lá số bạn đã lập hoặc mở gần đây.
          </p>
        </div>

        <Button asChild>
          <Link to="/">Lập lá số mới</Link>
        </Button>
      </div>

      <HistoryList />
    </main>
  );
}
