import type { ReactElement } from 'react';
import type { NhiThapBatTuResult } from '@/lib/nhi-thap-bat-tu';

export function NhiThapBatTuPanel({ pillars, verses }: NhiThapBatTuResult): ReactElement {
  return (
    <div className="rounded-2xl border border-ink/15 bg-day p-4 md:p-5">
      <div className="flex items-center justify-center gap-3 py-1">
        <span aria-hidden className="h-px max-w-24 flex-1 bg-ink/15" />
        <h2 className="text-center font-emphasis text-2xl font-bold text-ink">Nhị Thập Bát Tú</h2>
        <span aria-hidden className="h-px max-w-24 flex-1 bg-ink/15" />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
        {pillars.map((pillar) => (
          <div
            key={pillar.label}
            className="flex flex-col items-center gap-0.5 rounded-lg bg-day-200 px-2 py-3 text-center"
          >
            <p className="text-2xs font-bold tracking-wide text-ink-soft uppercase">
              {pillar.label}
            </p>
            <p className="font-display text-2xl leading-tight font-extrabold text-ink">
              {pillar.value}
            </p>
            <p className="text-sm font-semibold text-ink">{pillar.canChi}</p>
            <p className="mt-1 rounded-full bg-gold px-2.5 py-0.5 text-xs font-bold text-ink">
              Sao {pillar.tu.name}
            </p>
            <p className="mt-1 text-xs text-ink-soft">
              {pillar.tu.element} · {pillar.tu.animal}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {verses.map((verse) => (
          <div
            key={verse.subtitle}
            className="rounded-lg border border-ink/15 bg-day px-4 py-3 text-center"
          >
            <p className="text-base font-bold text-ink uppercase">{verse.tu.fullName}</p>
            <p className="text-xs text-ink-soft">{verse.subtitle}</p>
            <div className="mt-2 flex flex-col gap-0.5">
              {verse.tu.verse.map((line) => (
                <p
                  key={line}
                  className="font-emphasis text-base leading-relaxed font-semibold text-ink italic"
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
