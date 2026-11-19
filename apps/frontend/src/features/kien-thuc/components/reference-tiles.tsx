import { useId } from 'react';
import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { ContentKind, ENTRY_GROUPS_BY_KIND, EntryGroup } from '@org/shared-contracts';
import type { EntryKind, KienThucManifest } from '@org/shared-contracts';
import { DisplaySize, DisplayTitle, FOCUS_RING_CLASS, TitleFace } from '@/design-system';
import { cn } from '@/lib/utils';
import { indexPath } from '../kien-thuc-paths';
import { EMBLEM_WIDTH, groupEmblem } from '../kien-thuc-media';
import { entriesOfKind } from '../published-pages';
import { GROUP_LABEL } from './kien-thuc-labels';

const REFERENCE_TITLE = 'Tra cứu';
const REFERENCE_LEAD = 'Khi đã quen, tra từng sao, từng cung.';
const REFERENCE_KINDS: readonly EntryKind[] = [
  ContentKind.Sao,
  ContentKind.Cung,
  ContentKind.ThuatNgu,
];

const TILE_LABEL: Readonly<Record<EntryGroup, (count: number) => string>> = {
  [EntryGroup.ChinhTinh]: (count) => `${GROUP_LABEL[EntryGroup.ChinhTinh]} · ${count}`,
  [EntryGroup.TuHoa]: (count) => `${GROUP_LABEL[EntryGroup.TuHoa]} · ${count}`,
  [EntryGroup.PhuTinh]: (count) => `${GROUP_LABEL[EntryGroup.PhuTinh]} · ${count}`,
  [EntryGroup.Cung]: (count) => `${count} cung`,
  [EntryGroup.NguHanh]: () => GROUP_LABEL[EntryGroup.NguHanh],
  [EntryGroup.ThuatNgu]: () => GROUP_LABEL[EntryGroup.ThuatNgu],
};

const EMBLEM_DISPLAY_SIZE = '5rem';

const TILE_CLASS = cn(
  'flex min-h-11 items-center gap-4 rounded-2xl border border-ink/15 bg-day p-4 font-emphasis text-xl font-bold text-ink no-underline hover:inset-ring-2 hover:inset-ring-ink',
  FOCUS_RING_CLASS,
);

interface ReferenceTile {
  readonly group: EntryGroup;
  readonly label: string;
  readonly path: string;
  readonly hash: string | undefined;
}

interface GroupEmblemProps {
  readonly group: EntryGroup;
}

interface ReferenceTilesProps {
  readonly manifest: KienThucManifest;
}

function GroupEmblem({ group }: GroupEmblemProps): ReactElement {
  const emblem = groupEmblem(group);
  return (
    <img
      alt=""
      decoding="async"
      loading="lazy"
      width={EMBLEM_WIDTH.large}
      height={EMBLEM_WIDTH.large}
      sizes={EMBLEM_DISPLAY_SIZE}
      src={emblem.large}
      srcSet={`${emblem.small} ${EMBLEM_WIDTH.small}w, ${emblem.large} ${EMBLEM_WIDTH.large}w`}
      className="size-16 shrink-0 rounded-full md:size-20"
    />
  );
}

function referenceTiles(manifest: KienThucManifest): readonly ReferenceTile[] {
  return REFERENCE_KINDS.flatMap((kind) => {
    const entries = entriesOfKind(manifest, kind);
    const groups = ENTRY_GROUPS_BY_KIND[kind];
    const hasGroupAnchors = groups.length > 1;
    return groups.flatMap((group) => {
      const count = entries.filter((entry) => entry.group === group).length;
      if (count === 0) {
        return [];
      }
      return [
        {
          group,
          label: TILE_LABEL[group](count),
          path: indexPath(kind),
          hash: hasGroupAnchors ? group : undefined,
        },
      ];
    });
  });
}

export function ReferenceTiles({ manifest }: ReferenceTilesProps): ReactElement | null {
  const titleId = useId();
  const tiles = referenceTiles(manifest);
  if (tiles.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <DisplayTitle id={titleId} size={DisplaySize.Card} face={TitleFace.Serif}>
          {REFERENCE_TITLE}
        </DisplayTitle>
        <p className="text-lg text-ink-soft">{REFERENCE_LEAD}</p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {tiles.map((tile) => (
          <li key={tile.group}>
            <Link to={tile.path} hash={tile.hash} className={TILE_CLASS}>
              <GroupEmblem group={tile.group} />
              {tile.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
