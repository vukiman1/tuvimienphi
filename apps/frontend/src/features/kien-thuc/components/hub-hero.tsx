import type { ReactElement, ReactNode } from 'react';
import { DisplaySize, DisplayTitle, Emphasis, Eyebrow } from '@/design-system';
import { KienThucPainting } from './kien-thuc-painting';

const TITLE_LINE_CLASS = 'md:block md:leading-[1.05]';

interface HubHeroProps {
  readonly eyebrow: string;
  readonly title: string;
  readonly accent: string;
  readonly lead: string;
  readonly children: ReactNode;
}

export function HubHero({ eyebrow, title, accent, lead, children }: HubHeroProps): ReactElement {
  return (
    <section className="relative bg-night text-day md:flex md:min-h-[24rem] md:items-center xl:min-h-[27rem]">
      <KienThucPainting
        imageClassName="absolute inset-y-0 right-0 h-full w-auto max-w-none mask-l-from-60%"
        veilClassName="bg-linear-to-r from-night/90 via-night/40 to-transparent"
      />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 md:gap-4 md:px-6 md:py-8">
        <Eyebrow>{eyebrow}</Eyebrow>
        <div className="max-w-2xl min-w-0 break-words">
          <DisplayTitle as="h1" size={DisplaySize.Chapter}>
            <span className={TITLE_LINE_CLASS}>{title}</span>{' '}
            <span className={TITLE_LINE_CLASS}>
              <Emphasis isAccent>{accent}</Emphasis>
            </span>
          </DisplayTitle>
        </div>
        <p className="max-w-3xl text-lg text-day">{lead}</p>
        {children}
      </div>
    </section>
  );
}
