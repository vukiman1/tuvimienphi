import type { ReactElement } from 'react';
import { Chip } from '@/design-system';
import { SAO_ON_DAY_CLASS } from '@/features/la-so/chart-colors';
import type { ChinhTinhView, CungView, SaoView } from '@/features/la-so/chart-types';
import { HanhIcon } from '@/features/la-so/components/hanh-icon';
import { PanelSection } from '@/features/la-so/components/panel-section';
import { RATING_LABEL } from '@/features/la-so/components/cung-panel.constants';
import { cn } from '@/lib/utils';

interface ChinhTinhSectionProps {
  readonly cung: CungView;
  readonly muonTu: string | null;
}

interface PhuTinhSectionsProps {
  readonly cung: CungView;
  readonly viewYear: number;
}

interface StarGroup {
  readonly title: string;
  readonly stars: readonly SaoView[];
}

function ChinhTinhRow({ star }: { readonly star: ChinhTinhView }): ReactElement {
  return (
    <li className="flex items-center gap-2 text-reading">
      <span className={cn('flex items-center gap-2 font-semibold', SAO_ON_DAY_CLASS[star.element])}>
        <HanhIcon element={star.element} />
        {star.starName}
      </span>
      {star.rating ? <span className="text-ink-soft">{RATING_LABEL[star.rating]}</span> : null}
    </li>
  );
}

function voChinhDieuText(cung: CungView, muonTu: string | null): string {
  if (cung.chinhTinhMuon.length === 0) return 'Vô chính diệu';
  const borrowed = cung.chinhTinhMuon.map((star) => star.starName).join(', ');
  return `Vô chính diệu — mượn ${borrowed} từ cung ${muonTu}`;
}

export function ChinhTinhSection({ cung, muonTu }: ChinhTinhSectionProps): ReactElement {
  return (
    <PanelSection title="Chính tinh">
      {cung.isVoChinhDieu ? (
        <p className="text-reading">{voChinhDieuText(cung, muonTu)}</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {cung.chinhTinh.map((star) => (
            <ChinhTinhRow key={star.name} star={star} />
          ))}
        </ul>
      )}
    </PanelSection>
  );
}

export function PhuTinhSections({ cung, viewYear }: PhuTinhSectionsProps): ReactElement {
  const groups: readonly StarGroup[] = [
    { title: 'Cát tinh', stars: cung.catTinh },
    { title: 'Hung tinh', stars: cung.hungTinh },
    { title: `Năm ${viewYear}`, stars: cung.luuTinh },
    { title: 'Đại vận', stars: cung.daiVanTinh },
  ];

  return (
    <>
      {groups
        .filter((group) => group.stars.length > 0)
        .map((group) => (
          <PanelSection key={group.title} title={group.title}>
            <div className="flex flex-wrap gap-2">
              {group.stars.map((star) => (
                <span key={star.name} className={SAO_ON_DAY_CLASS[star.element]}>
                  <Chip>{star.name}</Chip>
                </span>
              ))}
            </div>
          </PanelSection>
        ))}
    </>
  );
}
