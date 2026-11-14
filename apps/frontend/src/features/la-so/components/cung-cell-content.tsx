import type { ReactElement } from 'react';
import type { CungView, SaoView } from '@/features/la-so/chart-types';
import { CHART_RULE_CLASS, SAO_ON_NIGHT_CLASS } from '@/features/la-so/chart-colors';
import { cn } from '@/lib/utils';

interface CungCellContentProps {
  readonly cung: CungView;
}

function SaoColumn({ sao }: { readonly sao: readonly SaoView[] }): ReactElement {
  return (
    <span className="flex min-w-0 flex-col gap-px">
      {sao.map((item) => (
        <span
          key={item.name}
          className={cn(
            'block truncate text-xs leading-4 font-semibold',
            SAO_ON_NIGHT_CLASS[item.element],
          )}
        >
          {item.name}
          {item.rating && <span className="text-2xs font-normal"> ({item.rating})</span>}
        </span>
      ))}
    </span>
  );
}

function SaoRow({
  sao,
  prefix,
}: {
  readonly sao: readonly SaoView[];
  readonly prefix: string;
}): ReactElement {
  return (
    <span className="flex flex-wrap gap-x-2 pt-0.5 text-xs leading-4 font-semibold">
      {sao.map((item) => (
        <span key={item.name} className={cn('whitespace-nowrap', SAO_ON_NIGHT_CLASS[item.element])}>
          {prefix}
          {item.name}
        </span>
      ))}
    </span>
  );
}

export function CungCellContent({ cung }: CungCellContentProps): ReactElement {
  return (
    <>
      {cung.isTieuHan ? (
        <span
          className={cn(
            'pointer-events-none absolute top-0 right-1 px-1.5 text-2xs leading-3 font-bold',
            CHART_RULE_CLASS.blockLabel,
          )}
        >
          Tiểu hạn
        </span>
      ) : null}
      <span className="flex h-full flex-col">
        <span className="flex items-baseline justify-between gap-1.5">
          <span className="shrink-0 text-xs leading-4 font-bold whitespace-nowrap text-day-soft">
            {cung.canChi}
          </span>
          <span className="truncate text-sm leading-5 font-bold text-dawn">
            {cung.name}
            {cung.isThan && <span className="text-day-soft">&lt;THÂN&gt;</span>}
          </span>
          <span className="text-xs leading-4 font-bold text-day-soft tabular-nums">
            {cung.daiVanStartAge}
          </span>
        </span>

        <span className="flex items-baseline justify-between gap-1.5">
          <span className="shrink-0 text-xs leading-4 font-bold whitespace-nowrap text-day-soft">
            {cung.element}
          </span>
          <span className="flex min-w-0 flex-wrap justify-center gap-x-2">
            {cung.isVoChinhDieu ? (
              <span className="text-xs leading-5 font-semibold text-day-soft">vô chính diệu</span>
            ) : (
              cung.chinhTinh.map((sao) => (
                <span
                  key={sao.name}
                  className={cn(
                    'text-sm leading-5 font-bold whitespace-nowrap',
                    SAO_ON_NIGHT_CLASS[sao.element],
                  )}
                >
                  {sao.polarity}
                  {sao.name}
                  {sao.rating && <span className="text-xs font-normal"> ({sao.rating})</span>}
                </span>
              ))
            )}
          </span>
          <span className="shrink-0 text-xs leading-4 font-bold whitespace-nowrap text-day-soft">
            {cung.monthOrder}
          </span>
        </span>

        {cung.chinhTinhMuon.length > 0 && (
          <span className="flex min-w-0 flex-wrap justify-center gap-x-2">
            {cung.chinhTinhMuon.map((sao) => (
              <span
                key={sao.name}
                className={cn(
                  'text-xs leading-4 font-semibold whitespace-nowrap',
                  SAO_ON_NIGHT_CLASS[sao.element],
                )}
              >
                ({sao.name}
                {sao.rating && ` ${sao.rating}`})
              </span>
            ))}
          </span>
        )}

        <span className="mt-1 grid flex-1 grid-cols-2 gap-x-1">
          <SaoColumn sao={cung.catTinh} />
          <SaoColumn sao={cung.hungTinh} />
        </span>

        {cung.luuTinh.length > 0 && <SaoRow prefix="L." sao={cung.luuTinh} />}

        {cung.daiVanTinh.length > 0 && <SaoRow prefix="ĐV." sao={cung.daiVanTinh} />}

        <span className="mt-auto flex items-baseline justify-between gap-1.5 pt-1 text-xs leading-4 font-semibold text-day-soft">
          <span>{cung.daiVan}</span>
          <span className="font-bold">{cung.trangSinh}</span>
          <span>{cung.luuNien}</span>
        </span>
      </span>
    </>
  );
}
