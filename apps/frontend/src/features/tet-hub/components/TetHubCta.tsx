import type { ReactElement } from 'react';
import { TET_HUB_VIEW_YEAR } from '@org/shared-tu-vi';
import { CtaButton, CtaTone, TextLink } from '@/design-system';
import { Gender } from '@/features/la-so/birth-input';
import { BIRTH_FORM_ANCHOR } from '@/features/home/home-anchors';

const CTA_COPY = `Tuổi chỉ cho biết nét chung. Nhập ngày giờ sinh để xem vận hạn ${TET_HUB_VIEW_YEAR} theo lá số của riêng bạn.`;

const GENDER_CTA_LABELS: Readonly<Record<Gender, string>> = {
  [Gender.Male]: 'Lập lá số cho nam mạng',
  [Gender.Female]: 'Lập lá số cho nữ mạng',
};

interface TetHubGenderCtaProps {
  readonly gender: Gender;
}

export function TetHubCta(): ReactElement {
  return (
    <section className="flex flex-col items-center gap-5 rounded-2xl bg-deep px-6 py-8 text-center text-day">
      <p className="text-reading leading-reading">{CTA_COPY}</p>
      <CtaButton
        to="/"
        search={{ viewYear: TET_HUB_VIEW_YEAR }}
        hash={BIRTH_FORM_ANCHOR}
        tone={CtaTone.Gold}
      >
        Lập lá số của bạn
      </CtaButton>
    </section>
  );
}

export function TetHubGenderCta({ gender }: TetHubGenderCtaProps): ReactElement {
  return (
    <TextLink to="/" search={{ viewYear: TET_HUB_VIEW_YEAR, gender }} hash={BIRTH_FORM_ANCHOR}>
      {GENDER_CTA_LABELS[gender]}
      <span aria-hidden>&nbsp;→</span>
    </TextLink>
  );
}
