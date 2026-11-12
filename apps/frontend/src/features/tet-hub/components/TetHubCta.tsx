import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { TET_HUB_VIEW_YEAR } from '@org/shared-tu-vi';
import { Gender } from '@/features/la-so/birth-input';
import { BIRTH_FORM_ANCHOR } from '@/features/home/home-anchors';

const CTA_COPY = `Tuổi chỉ cho biết nét chung. Nhập ngày giờ sinh để xem vận hạn ${TET_HUB_VIEW_YEAR} theo lá số của riêng bạn.`;

const GENDER_CTA_LABELS: Readonly<Record<Gender, string>> = {
  [Gender.Male]: 'Lập lá số cho nam mạng',
  [Gender.Female]: 'Lập lá số cho nữ mạng',
};

const CTA_LINK_CLASS =
  'inline-flex items-center gap-2 rounded-full bg-[#9e2b1e] px-6 py-2.5 text-[13px] font-semibold tracking-wide text-[#fdf3dc] no-underline transition-colors hover:bg-[#8a2318] focus-visible:ring-2 focus-visible:ring-[#e0bd76] focus-visible:outline-none';

interface TetHubGenderCtaProps {
  readonly gender: Gender;
}

export function TetHubCta(): ReactElement {
  return (
    <section className="rounded-2xl border border-[#e0cfa5] bg-[#faf5ea] px-6 py-6 text-center">
      <p className="text-[17px] leading-relaxed text-[#2a1f0e]">{CTA_COPY}</p>
      <Link
        to="/"
        search={{ viewYear: TET_HUB_VIEW_YEAR }}
        hash={BIRTH_FORM_ANCHOR}
        className={`${CTA_LINK_CLASS} mt-4`}
      >
        Lập lá số của bạn
      </Link>
    </section>
  );
}

export function TetHubGenderCta({ gender }: TetHubGenderCtaProps): ReactElement {
  return (
    <Link
      to="/"
      search={{ viewYear: TET_HUB_VIEW_YEAR, gender }}
      hash={BIRTH_FORM_ANCHOR}
      className="inline-flex items-center gap-1 text-[15px] font-semibold text-[#9e2b1e] underline-offset-4 hover:underline"
    >
      {GENDER_CTA_LABELS[gender]}
      <span aria-hidden>→</span>
    </Link>
  );
}
