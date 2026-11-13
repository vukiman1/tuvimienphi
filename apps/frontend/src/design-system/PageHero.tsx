import type { ReactElement, ReactNode } from 'react';
import { DisplaySize, DisplayTitle } from './DisplayTitle';
import { Eyebrow } from './Eyebrow';
import { Orbit } from './geometry/Orbit';

const ORBIT_POINTS = 12;
const ORBIT_VERTICAL_SCALE = 0.42;
const ORBIT_POINT_RADIUS = 0.7;
export const PAINTING_WIDTH = { small: 768, large: 1536 } as const;

export interface PagePainting {
  readonly small: string;
  readonly large: string;
}

interface PageHeroProps {
  readonly breadcrumb: ReactNode;
  readonly eyebrow: string;
  readonly title: ReactNode;
  readonly lead?: string;
  readonly painting?: PagePainting;
  readonly children?: ReactNode;
}

function HeroPainting({ painting }: { readonly painting: PagePainting }): ReactElement {
  return (
    <>
      <img
        alt=""
        decoding="async"
        fetchPriority="low"
        loading="lazy"
        sizes="100vw"
        src={painting.large}
        srcSet={`${painting.small} ${PAINTING_WIDTH.small}w, ${painting.large} ${PAINTING_WIDTH.large}w`}
        className="pointer-events-none absolute inset-0 hidden size-full object-cover object-[70%_12%] md:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden bg-linear-to-r from-night/90 via-night/50 to-transparent md:block"
      />
    </>
  );
}

function HeroOrnament(): ReactElement {
  return (
    <Orbit
      rings={1}
      points={ORBIT_POINTS}
      verticalScale={ORBIT_VERTICAL_SCALE}
      pointRadius={ORBIT_POINT_RADIUS}
      className="pointer-events-none absolute top-1/2 -right-1/6 hidden w-1/2 -translate-y-1/2 text-gold/40 xl:block"
    />
  );
}

export function PageHero({
  breadcrumb,
  eyebrow,
  title,
  lead,
  painting,
  children,
}: PageHeroProps): ReactElement {
  return (
    <section className="relative overflow-clip bg-night text-day">
      {painting === undefined ? <HeroOrnament /> : <HeroPainting painting={painting} />}
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 md:px-6 md:py-16">
        {breadcrumb}
        <div className="flex flex-col gap-4">
          <div className="text-dawn">
            <Eyebrow>{eyebrow}</Eyebrow>
          </div>
          <div className="max-w-2xl min-w-0 break-words">
            <DisplayTitle as="h1" size={DisplaySize.Chapter}>
              {title}
            </DisplayTitle>
          </div>
          {lead === undefined ? null : (
            <p className="max-w-reading text-lg text-day-soft">{lead}</p>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
