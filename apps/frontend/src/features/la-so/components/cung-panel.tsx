import { useId, type ReactElement } from 'react';
import { Chip, DisplaySize, DisplayTitle, TitleFace } from '@/design-system';
import { CUNG_Y_NGHIA } from '@org/shared-tu-vi';
import type { BirthInput } from '@/features/la-so/birth-input';
import type { ChartView } from '@/features/la-so/chart-types';
import { ChinhTinhSection, PhuTinhSections } from '@/features/la-so/components/cung-panel-stars';
import { QuickLuanSection } from '@/features/la-so/components/quick-luan-section';
import { CUNG_EMBLEM_WIDTH, cungEmblem } from '@/features/la-so/cung-emblem';
import { cungFacts } from '@/features/la-so/cung-facts';

const TAG_CLASS = 'bg-night px-2 py-1 text-2xs font-bold text-day';
const EMBLEM_DISPLAY_SIZE = '3.5rem';

interface CungPanelProps {
  readonly chart: ChartView;
  readonly index: number;
  readonly birth: BirthInput;
  readonly viewYear: number;
  readonly onReadChapter: (order: string) => void;
}

export function CungPanel({
  chart,
  index,
  birth,
  viewYear,
  onReadChapter,
}: CungPanelProps): ReactElement {
  const titleId = useId();
  const cung = chart.cungs[index];
  const facts = cungFacts(chart, index);
  const emblem = cungEmblem(facts.cungName);

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <img
          alt=""
          className="size-14 shrink-0 rounded-full"
          decoding="async"
          loading="lazy"
          sizes={EMBLEM_DISPLAY_SIZE}
          src={emblem.small}
          srcSet={`${emblem.small} ${CUNG_EMBLEM_WIDTH.small}w, ${emblem.large} ${CUNG_EMBLEM_WIDTH.large}w`}
        />
        <div className="flex flex-wrap items-center gap-2">
          <DisplayTitle as="h2" id={titleId} face={TitleFace.Serif} size={DisplaySize.Panel}>
            Cung {facts.cungName} <span className="text-ink-soft">· {cung.chi}</span>
          </DisplayTitle>
          {cung.isThan ? <span className={TAG_CLASS}>THÂN</span> : null}
          {cung.isTieuHan ? <span className={TAG_CLASS}>Tiểu hạn {viewYear}</span> : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Chip>
          Đại vận {facts.daiVan.from}–{facts.daiVan.to} tuổi
        </Chip>
        <Chip>Tam hợp: {facts.tamHop.join(' · ')}</Chip>
        <Chip>Xung chiếu: {facts.xungChieu}</Chip>
        <Chip>Nhị hợp: {facts.nhiHop}</Chip>
        {facts.anNgu.map((name) => (
          <Chip key={name}>{name}</Chip>
        ))}
      </div>

      <p className="text-reading">{CUNG_Y_NGHIA[facts.cungName]}</p>

      <ChinhTinhSection cung={cung} muonTu={facts.muonTu} />
      <QuickLuanSection
        birth={birth}
        chart={chart}
        cung={facts.cungName}
        onReadChapter={onReadChapter}
      />
      <PhuTinhSections cung={cung} viewYear={viewYear} />
    </section>
  );
}
