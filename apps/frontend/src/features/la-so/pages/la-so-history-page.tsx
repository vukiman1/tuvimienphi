import type { ReactElement } from 'react';
import { Plus } from 'lucide-react';
import { CtaButton, CtaTone, Orbit, PageHero } from '@/design-system';
import { HistoryList } from '@/features/la-so/history/components/history-list';

const FOOTER_ORBIT_RINGS = 2;

export function LaSoHistoryPage(): ReactElement {
  return (
    <main className="w-full bg-day">
      <PageHero title="Lá số đã xem" lead="Những lá số bạn đã lập hoặc mở gần đây.">
        <div>
          <CtaButton to="/" tone={CtaTone.Gold}>
            <Plus aria-hidden className="size-4" />
            Lập lá số mới
          </CtaButton>
        </div>
      </PageHero>

      <section>
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
          <HistoryList />
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl items-center justify-center gap-3 px-4 pb-12 md:px-6">
        <Orbit rings={FOOTER_ORBIT_RINGS} className="size-6 text-gold" />
        <p className="text-sm tracking-widest text-ink-soft">THIÊN THỜI · ĐỊA LỢI · NHÂN HÒA</p>
      </footer>
    </main>
  );
}
