import type { ReactElement } from 'react';
import { ArrowRight } from 'lucide-react';
import { EntryGroup } from '@org/shared-contracts';
import {
  CtaButton,
  CtaTone,
  DisplaySize,
  DisplayTitle,
  PAINTING_WIDTH,
  TitleFace,
} from '@/design-system';
import { BIRTH_FORM_ANCHOR } from '@/features/home/home-anchors';
import { EMBLEM_WIDTH, KIEN_THUC_PAINTING, groupEmblem } from '../kien-thuc-media';

const MARK_EMBLEM = groupEmblem(EntryGroup.ChinhTinh);

function CtaPainting(): ReactElement {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden md:block">
      <img
        alt=""
        decoding="async"
        fetchPriority="low"
        loading="lazy"
        sizes="100vw"
        src={KIEN_THUC_PAINTING.large}
        srcSet={`${KIEN_THUC_PAINTING.small} ${PAINTING_WIDTH.small}w, ${KIEN_THUC_PAINTING.large} ${PAINTING_WIDTH.large}w`}
        className="size-full object-cover object-[70%_80%]"
      />
      <div className="absolute inset-0 bg-linear-to-r from-night via-night/80 to-night/30" />
    </div>
  );
}

export function KienThucCta(): ReactElement {
  return (
    <section className="relative overflow-clip rounded-2xl bg-night text-day">
      <CtaPainting />
      <div className="relative flex flex-col items-start gap-5 px-6 py-8 md:flex-row md:items-center md:gap-6 md:px-10 md:py-10">
        <img
          alt=""
          decoding="async"
          loading="lazy"
          width={EMBLEM_WIDTH.small}
          height={EMBLEM_WIDTH.small}
          src={MARK_EMBLEM.small}
          className="size-14 shrink-0 rounded-full md:size-16"
        />
        <div className="min-w-0 flex-1">
          <DisplayTitle size={DisplaySize.Card} face={TitleFace.Serif}>
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
