import type { ReactElement } from 'react';
import { TAM_TAI_ORDINALS, type TuoiNamFacts, type TuoiNamGenderFacts } from '@org/shared-tu-vi';
import { cn } from '@/lib/utils';
import { thaiTueRelationsLabel } from '../tuoi-nam-labels';

const SUMMARY_TITLE_ID = 'tuoi-nam-summary-title';
const NOT_AFFECTED = 'Không phạm';

interface TuoiNamSummaryProps {
  readonly facts: TuoiNamFacts;
  readonly className?: string;
}

interface SummaryRowProps {
  readonly label: string;
  readonly value: string;
}

interface GenderRowProps {
  readonly titleId: string;
  readonly title: string;
  readonly facts: TuoiNamGenderFacts;
}

function tamTaiValue(facts: TuoiNamFacts): string {
  if (facts.tamTai === null) return NOT_AFFECTED;
  return `Năm ${TAM_TAI_ORDINALS[facts.tamTai]} trong ba năm`;
}

function thaiTueValue(facts: TuoiNamFacts): string {
  if (facts.thaiTue.length === 0) return NOT_AFFECTED;
  return `Phạm ${thaiTueRelationsLabel(facts.thaiTue)}`;
}

function SummaryRow({ label, value }: SummaryRowProps): ReactElement {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-day/15 py-2 last:border-b-0">
      <dt className="text-sm text-dawn">{label}</dt>
      <dd className="text-right text-base font-semibold">{value}</dd>
    </div>
  );
}

function GenderRow({ titleId, title, facts }: GenderRowProps): ReactElement {
  return (
    <div
      role="group"
      aria-labelledby={titleId}
      className="rounded-xl border border-gold/30 bg-deep/60 px-4 py-3"
    >
      <h3 id={titleId} className="text-sm font-bold tracking-wide text-dawn uppercase">
        {title}
      </h3>
      <dl className="mt-1">
        <SummaryRow label="Sao chiếu mệnh" value={facts.sao} />
        <SummaryRow label="Hạn" value={facts.han} />
      </dl>
    </div>
  );
}

export function TuoiNamSummary({ facts, className }: TuoiNamSummaryProps): ReactElement {
  return (
    <aside
      aria-labelledby={SUMMARY_TITLE_ID}
      className={cn(
        'rounded-2xl border border-gold/40 bg-night px-5 py-5 text-day shadow-glow-gold',
        className,
      )}
    >
      <h2 id={SUMMARY_TITLE_ID} className="font-display text-xl font-bold">
        {facts.canChi} {facts.birthYear} · Năm {facts.viewYear}
      </h2>
      <dl className="mt-3">
        <SummaryRow label="Tuổi âm (tuổi mụ)" value={String(facts.tuoi)} />
        <SummaryRow label="Mệnh" value={facts.menh.name} />
        <SummaryRow label="Tam tai" value={tamTaiValue(facts)} />
        <SummaryRow label="Thái tuế" value={thaiTueValue(facts)} />
      </dl>
      <div className="mt-4 flex flex-col gap-3">
        <GenderRow titleId="tuoi-nam-summary-nam" title="Nam mạng" facts={facts.nam} />
        <GenderRow titleId="tuoi-nam-summary-nu" title="Nữ mạng" facts={facts.nu} />
      </div>
    </aside>
  );
}
