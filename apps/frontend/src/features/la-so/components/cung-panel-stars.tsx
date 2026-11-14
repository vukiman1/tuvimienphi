import type { ReactElement } from 'react';
import { CHINH_TINH_NAMES } from '@org/shared-tu-vi';
import { Chip } from '@/design-system';
import { SAO_ON_DAY_CLASS } from '@/features/la-so/chart-colors';
import type { ChinhTinhView, CungView, SaoView } from '@/features/la-so/chart-types';
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

function titleCaseChinhTinh(name: string): string {
  return CHINH_TINH_NAMES.find((candidate) => candidate.toUpperCase() === name) ?? name;
}

function ChinhTinhRow({ star }: { readonly star: ChinhTinhView }): ReactElement {
  return (
    <li className="flex items-center gap-2 text-reading">
      <span className={cn('flex items-center gap-2 font-semibold', SAO_ON_DAY_CLASS[star.element])}>
        <span className="size-2 rounded-full bg-current" />
        {titleCaseChinhTinh(star.name)}
      </span>
      {star.rating ? <span className="text-ink-soft">{RATING_LABEL[star.rating]}</span> : null}
    </li>
  );
}

export function ChinhTinhSection({ cung, muonTu }: ChinhTinhSectionProps): ReactElement {
  return (
    <PanelSection title="Chính tinh">
      {cung.isVoChinhDieu ? (
        <p className="text-reading">
          Vô chính diệu — mượn{' '}
          {cung.chinhTinhMuon.map((star) => titleCaseChinhTinh(star.name)).join(', ')} từ cung{' '}
          {muonTu}
        </p>
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
