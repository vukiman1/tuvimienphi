import type { ReactElement } from 'react';
import { ArrowRight } from 'lucide-react';
import { EntryGroup } from '@org/shared-contracts';
import { CtaButton, CtaTone, DisplaySize, DisplayTitle, TitleFace } from '@/design-system';
import { BIRTH_FORM_ANCHOR } from '@/features/home/home-anchors';
import { EMBLEM_WIDTH, groupEmblem } from '../kien-thuc-media';
import { KienThucPainting } from './kien-thuc-painting';

const MARK_EMBLEM = groupEmblem(EntryGroup.ChinhTinh);

interface KienThucCtaProps {
  readonly titleSize?: DisplaySize;
}

export function KienThucCta({ titleSize = DisplaySize.Card }: KienThucCtaProps): ReactElement {
  return (
    <section className="relative overflow-clip rounded-2xl bg-night text-day">
      <KienThucPainting
        imageClassName="size-full object-cover object-[70%_80%]"
        veilClassName="bg-linear-to-r from-night via-night/80 to-night/30"
      />
      <div className="relative flex flex-col items-start gap-6 px-6 py-8 md:flex-row md:items-center md:px-10 md:py-10">
        <div className="flex min-w-0 flex-1 items-center gap-4 md:gap-6">
          <img
            alt=""
            decoding="async"
            loading="lazy"
            width={EMBLEM_WIDTH.small}
            height={EMBLEM_WIDTH.small}
            src={MARK_EMBLEM.small}
            className="size-14 shrink-0 rounded-full md:size-16"
          />
          <DisplayTitle size={titleSize} face={TitleFace.Serif}>
            Áp vào lá số của bạn
          </DisplayTitle>
        </div>
        <CtaButton to="/" hash={BIRTH_FORM_ANCHOR} tone={CtaTone.Gold}>
          Lập lá số
          <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
        </CtaButton>
      </div>
    </section>
  );
}
