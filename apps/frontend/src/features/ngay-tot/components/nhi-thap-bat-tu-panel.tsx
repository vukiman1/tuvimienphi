import type { NhiThapBatTuResult } from '@/lib/nhi-thap-bat-tu';

export function NhiThapBatTuPanel({ pillars, verses }: NhiThapBatTuResult) {
  return (
    <div className="rounded-xl border border-[#c9a15c]/40 bg-card p-3 shadow-md md:p-4">
      <div className="flex items-center justify-center gap-3 py-1">
        <span className="h-px max-w-24 flex-1 bg-gradient-to-r from-transparent to-[#c9a15c]/70" />
        <p className="font-display text-lg font-bold whitespace-nowrap text-primary">
          Nhị Thập Bát Tú
        </p>
        <span className="h-px max-w-24 flex-1 bg-gradient-to-l from-transparent to-[#c9a15c]/70" />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
        {pillars.map((pillar) => (
          <div
            key={pillar.label}
            className="flex flex-col items-center gap-0.5 rounded-lg border border-[#c9a15c]/30 bg-gradient-to-b from-[#c9a15c]/10 to-transparent px-2 py-3 text-center"
          >
            <p className="text-[0.65rem] font-bold tracking-wide text-muted-foreground uppercase">
              {pillar.label}
            </p>
            <p className="font-display text-2xl leading-tight font-bold text-primary">
              {pillar.value}
            </p>
            <p className="text-sm font-semibold text-foreground">{pillar.canChi}</p>
            <p className="mt-1 rounded-full bg-gradient-to-br from-[#e8c987] to-[#b8894a] px-2.5 py-0.5 text-xs font-bold text-[#1a1a1c]">
              Sao {pillar.tu.name}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {pillar.tu.element} · {pillar.tu.animal}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {verses.map((verse) => (
          <div
            key={verse.subtitle}
            className="rounded-lg border border-[#c9a15c]/30 bg-muted/20 px-4 py-3 text-center"
          >
            <p className="font-display text-base font-bold text-primary uppercase">
              {verse.tu.fullName}
            </p>
            <p className="text-xs text-muted-foreground">{verse.subtitle}</p>
            <div className="mt-2 flex flex-col gap-0.5">
              {verse.tu.verse.map((line) => (
                <p key={line} className="text-sm leading-relaxed text-foreground italic">
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
