import type { ReactElement } from 'react';
import { ENTRY_GROUPS_BY_KIND, EntryGroup } from '@org/shared-contracts';
import { Breadcrumb, DisplaySize, DisplayTitle, PageHero, TitleFace } from '@/design-system';
import { EntryTile } from '../components/entry-tile';
import { GROUP_LABEL, KIND_INDEX_LEAD, KIND_INDEX_TITLE } from '../components/kien-thuc-labels';
import { LetterStrip } from '../components/letter-strip';
import { groupByLetter, letterAnchor, sortGlossary } from '../glossary-order';
import { indexBreadcrumb } from '../kien-thuc-breadcrumb';
import type { FoundIndexPageData, IndexGroup, IndexTile } from '../route-data/index-route';

const TILE_GRID_CLASS = 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3';

interface IndexPageProps {
  readonly data: FoundIndexPageData;
}

interface TileGridProps {
  readonly tiles: readonly IndexTile[];
}

interface GroupSectionProps {
  readonly group: IndexGroup;
  readonly hasHeading: boolean;
}

interface GlossaryProps {
  readonly tiles: readonly IndexTile[];
}

function TileGrid({ tiles }: TileGridProps): ReactElement {
  return (
    <ul className={TILE_GRID_CLASS}>
      {tiles.map(({ entry, summary }) => (
        <li key={entry.slug}>
          <EntryTile kind={entry.kind} slug={entry.slug} title={entry.title} summary={summary} />
        </li>
      ))}
    </ul>
  );
}

function Glossary({ tiles }: GlossaryProps): ReactElement {
  const letterGroups = groupByLetter(sortGlossary(tiles));

  return (
    <div className="flex flex-col gap-8">
      <LetterStrip letters={letterGroups.map(({ letter }) => letter)} />
      {letterGroups.map(({ letter, tiles: letterTiles }) => (
        <div key={letter} className="flex flex-col gap-4">
          <DisplayTitle
            as="h3"
            id={letterAnchor(letter)}
            tabIndex={-1}
            size={DisplaySize.Panel}
            face={TitleFace.Serif}
          >
            {letter}
          </DisplayTitle>
          <TileGrid tiles={letterTiles} />
        </div>
      ))}
    </div>
  );
}

function GroupSection({ group, hasHeading }: GroupSectionProps): ReactElement {
  const isGlossary = group.group === EntryGroup.ThuatNgu;

  return (
    <section aria-labelledby={hasHeading ? group.group : undefined} className="flex flex-col gap-6">
      {hasHeading && (
        <DisplayTitle
          id={group.group}
          tabIndex={-1}
          size={DisplaySize.Panel}
          face={TitleFace.Serif}
        >
          {GROUP_LABEL[group.group]}
        </DisplayTitle>
      )}
      {isGlossary ? <Glossary tiles={group.tiles} /> : <TileGrid tiles={group.tiles} />}
    </section>
  );
}

export function IndexPage({ data }: IndexPageProps): ReactElement {
  const { kind, groups } = data;
  const hasGroupHeadings = ENTRY_GROUPS_BY_KIND[kind].length > 1;

  return (
    <main className="w-full bg-day">
      <PageHero
        breadcrumb={<Breadcrumb items={indexBreadcrumb(kind)} />}
        title={KIND_INDEX_TITLE[kind]}
        lead={KIND_INDEX_LEAD[kind]}
      />
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-10 md:px-6">
        {groups.map((group) => (
          <GroupSection key={group.group} group={group} hasHeading={hasGroupHeadings} />
        ))}
      </div>
    </main>
  );
}
