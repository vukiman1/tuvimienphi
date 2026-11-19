import type { ReactElement } from 'react';
import { CtaButton, CtaTone, DisplaySize, DisplayTitle, TitleFace } from '@/design-system';
import { BIRTH_FORM_ANCHOR } from '@/features/home/home-anchors';

export function KienThucCta(): ReactElement {
  return (
    <section className="flex flex-col items-center gap-5 rounded-2xl bg-night px-6 py-8 text-center text-day">
      <DisplayTitle size={DisplaySize.Card} face={TitleFace.Serif}>
        Áp vào lá số của bạn
      </DisplayTitle>
      <CtaButton to="/" hash={BIRTH_FORM_ANCHOR} tone={CtaTone.Gold}>
        Lập lá số
      </CtaButton>
    </section>
  );
}
