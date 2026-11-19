import type { ReactElement, ReactNode } from 'react';
import { ContentKind, pageRef } from '@org/shared-contracts';
import type { KienThucManifest } from '@org/shared-contracts';
import { SaoKind } from '@org/shared-kien-thuc';
import type { CungRelationFacts, SaoFacts, SaoRatingCell, TuHoaByCan } from '@org/shared-kien-thuc';
import { CAN, CHI } from '@org/shared-tu-vi';
import type { CungName, Rating } from '@org/shared-tu-vi';
import { TextLink } from '@/design-system';
import { RATING_LABEL } from '@/features/la-so/components/cung-panel.constants';
import { CUNG_SLUGS } from '@/features/la-so/cung-slug';
import { EntryFactsKind } from '../entry-facts';
import type { EntryFacts } from '../entry-facts';
import { isPublished } from '../published-pages';

const FACTS_TITLE_ID = 'facts-title';
const FACTS_TITLE = 'Dữ kiện từ lá số';
const HUNG_TINH_YES = 'Có';
const HUNG_TINH_NO = 'Không';
const NO_RATING_MARK = '—';
const NO_RATING_TEXT = 'không có trong bảng';
const CUNG_ENTRY_ROUTE = '/kien-thuc/cung/$slug';

interface FactsBlockProps {
  readonly facts: EntryFacts;
  readonly manifest: KienThucManifest;
}

interface FactRowProps {
  readonly term: string;
  readonly children: ReactNode;
}

interface CungFactRowsProps {
  readonly facts: CungRelationFacts;
  readonly manifest: KienThucManifest;
}

interface CungPartnerProps {
  readonly name: CungName;
  readonly manifest: KienThucManifest;
}

function FactRow({ term, children }: FactRowProps): ReactElement {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-sm font-semibold text-ink-soft">{term}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function RatingCellValue({ rating }: { readonly rating: Rating | undefined }): ReactElement {
  if (rating === undefined) {
    return (
      <>
        <span aria-hidden="true">{NO_RATING_MARK}</span>
        <span className="sr-only">{NO_RATING_TEXT}</span>
      </>
    );
  }
  return <span className="font-bold">{RATING_LABEL[rating]}</span>;
}

function RatingGrid({ ratings }: { readonly ratings: readonly SaoRatingCell[] }): ReactElement {
  const ratingByChi = new Map(ratings.map((cell) => [cell.chi, cell.rating]));
  return (
    <ul className="grid grid-cols-6 gap-1 sm:grid-cols-12">
      {CHI.map((chiName, chi) => (
        <li
          key={chiName}
          className="flex flex-col items-center gap-1 rounded-lg bg-day px-1 py-2 text-center text-xs"
        >
          <span className="text-ink-soft">{chiName}</span>
          <RatingCellValue rating={ratingByChi.get(chi)} />
        </li>
      ))}
    </ul>
  );
}

function HoaByCanList({ rows }: { readonly rows: readonly TuHoaByCan[] }): ReactElement {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-5">
      {rows.map(({ can, star }) => (
        <li key={can} className="flex flex-col">
          <span className="text-sm text-ink-soft">{CAN[can]}</span>
          <span className="font-semibold">{star}</span>
        </li>
      ))}
    </ul>
  );
}

function SaoFactRows({ facts }: { readonly facts: SaoFacts }): ReactElement {
  return (
    <>
      <FactRow term="Hành">{facts.hanh}</FactRow>
      {facts.kind === SaoKind.ChinhTinh ? (
        <FactRow term="Chòm">{facts.chom}</FactRow>
      ) : (
        <FactRow term="Hung tinh">{facts.isHung ? HUNG_TINH_YES : HUNG_TINH_NO}</FactRow>
      )}
      {facts.ratings.length > 0 && (
        <FactRow term="Bậc theo địa chi">
          <RatingGrid ratings={facts.ratings} />
        </FactRow>
      )}
      {facts.kind === SaoKind.TuHoa && (
        <FactRow term="Hóa theo can năm">
          <HoaByCanList rows={facts.byCan} />
        </FactRow>
      )}
    </>
  );
}

function CungPartner({ name, manifest }: CungPartnerProps): ReactElement {
  const slug = CUNG_SLUGS[name];
  if (!isPublished(manifest, pageRef(ContentKind.Cung, slug))) {
    return <span>{name}</span>;
  }
  return (
    <TextLink to={CUNG_ENTRY_ROUTE} params={{ slug }}>
      {name}
    </TextLink>
  );
}

function CungFactRows({ facts, manifest }: CungFactRowsProps): ReactElement {
  return (
    <>
      <FactRow term="Đối cung">
        <CungPartner name={facts.doiCung} manifest={manifest} />
      </FactRow>
      <FactRow term="Tam hợp">
        <ul className="flex flex-wrap items-center gap-x-6">
          {facts.tamHop.map((name) => (
            <li key={name}>
              <CungPartner name={name} manifest={manifest} />
            </li>
          ))}
        </ul>
      </FactRow>
    </>
  );
}

export function FactsBlock({ facts, manifest }: FactsBlockProps): ReactElement | null {
  if (facts.kind === EntryFactsKind.None) {
    return null;
  }
  return (
    <section
      aria-labelledby={FACTS_TITLE_ID}
      className="rounded-2xl bg-day-200 px-4 py-6 text-ink sm:px-6"
    >
      <h2 id={FACTS_TITLE_ID} className="text-xl font-bold">
        {FACTS_TITLE}
      </h2>
      <dl className="mt-4 flex flex-col gap-5">
        {facts.kind === EntryFactsKind.Sao ? (
          <SaoFactRows facts={facts.facts} />
        ) : (
          <CungFactRows facts={facts.facts} manifest={manifest} />
        )}
      </dl>
    </section>
  );
}
