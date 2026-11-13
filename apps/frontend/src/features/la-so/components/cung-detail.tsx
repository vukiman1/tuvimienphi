import type { ReactElement } from 'react';
import type { CungView } from '@/features/la-so/chart-types';
import { CHART_RULE_CLASS, CUNG_SURFACE_CLASS } from '@/features/la-so/chart-colors';
import { CungCellContent } from '@/features/la-so/components/cung-cell-content';
import { cn } from '@/lib/utils';

export function CungDetail({ cung }: { readonly cung: CungView }): ReactElement {
  return (
    <section
      aria-label={`Cung ${cung.name}`}
      className={cn(
        'relative mx-auto block w-full max-w-sm border px-2 py-4',
        CHART_RULE_CLASS.border,
        CUNG_SURFACE_CLASS.base,
      )}
    >
      <CungCellContent cung={cung} />
    </section>
  );
}
