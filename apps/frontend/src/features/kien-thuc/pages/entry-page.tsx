import type { ReactElement } from 'react';
import { pageRef } from '@org/shared-contracts';
import type {
  ContentSection,
  EntryFile,
  KienThucManifest,
  ManifestEntry,
} from '@org/shared-contracts';
import {
  Breadcrumb,
  DisplaySize,
  DisplayTitle,
  PageHero,
  ReadingZone,
  TextLink,
  TitleFace,
} from '@/design-system';
import { EntryTile } from '../components/entry-tile';
import { FactsBlock } from '../components/facts-block';
import { KienThucCta } from '../components/kien-thuc-cta';
import { MethodologyNote } from '../components/methodology-note';
import type { SearchIndexLoader } from '../content-source';
import { EntryFactsKind, entryFacts } from '../entry-facts';
import { entryBreadcrumb } from '../kien-thuc-breadcrumb';
import { OWNER_READ_REFS } from '../owner-read-refs';
import { ProseParagraph } from '../prose/prose-paragraph';
import { ProseProvider } from '../prose/prose-context';
import { publishedLesson } from '../published-pages';
import { relatedEntries } from '../related-entries';
import { formatReviewedAt } from '../reviewed-date';

const LESSON_ROUTE = '/kien-thuc/$slug';
const BYLINE = 'Biên soạn: Admin';
const RELATED_TITLE_ID = 'related-title';
const RELATED_TITLE = 'Mục liên quan';

interface EntryPageProps {
  readonly entry: EntryFile;
  readonly manifest: KienThucManifest;
  readonly loadSearchIndex: SearchIndexLoader;
}

interface LearnInLessonLinkProps {
  readonly slug: string;
  readonly manifest: KienThucManifest;
}

interface RelatedEntriesProps {
  readonly entries: readonly ManifestEntry[];
}

function EntryHero({ entry }: { readonly entry: EntryFile }): ReactElement {
  return (
    <PageHero
      breadcrumb={<Breadcrumb items={entryBreadcrumb(entry)} />}
      title={entry.title}
      lead={entry.summary}
    >
      <p className="text-sm text-day-soft">
        {'Cập nhật '}
        <time dateTime={entry.reviewedAt}>{formatReviewedAt(entry.reviewedAt)}</time>
        {` · ${BYLINE}`}
      </p>
    </PageHero>
  );
}

function EntrySection({ section }: { readonly section: ContentSection }): ReactElement {
  return (
    <section>
      <DisplayTitle size={DisplaySize.Panel} face={TitleFace.Serif}>
        {section.heading}
      </DisplayTitle>
      <div className="mt-4 flex flex-col gap-4">
        {section.paragraphs.map((paragraph, index) => (
          <ProseParagraph key={index} text={paragraph} />
        ))}
      </div>
    </section>
  );
}

function LearnInLessonLink({ slug, manifest }: LearnInLessonLinkProps): ReactElement | null {
  const lesson = publishedLesson(manifest, slug);
  if (!lesson) {
    return null;
  }
  return (
    <div>
      <TextLink to={LESSON_ROUTE} params={{ slug: lesson.slug }}>
        {`Học trong Bước ${lesson.step}: ${lesson.stepTitle} →`}
      </TextLink>
    </div>
  );
}

function RelatedEntries({ entries }: RelatedEntriesProps): ReactElement | null {
  if (entries.length === 0) {
    return null;
  }
  return (
    <section aria-labelledby={RELATED_TITLE_ID}>
      <DisplayTitle id={RELATED_TITLE_ID} size={DisplaySize.Panel} face={TitleFace.Serif}>
        {RELATED_TITLE}
      </DisplayTitle>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {entries.map((related) => (
          <li key={related.slug}>
            <EntryTile kind={related.kind} slug={related.slug} title={related.title} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function EntryPage({ entry, manifest, loadSearchIndex }: EntryPageProps): ReactElement {
  const ref = pageRef(entry.kind, entry.slug);
  const facts = entryFacts(ref);

  return (
    <main className="w-full bg-day">
      <EntryHero entry={entry} />
      <section className="px-4 py-10 md:px-6 md:py-14">
        <ReadingZone>
          <div className="flex flex-col gap-12">
            <FactsBlock facts={facts} manifest={manifest} />
            <ProseProvider manifest={manifest} loadSearchIndex={loadSearchIndex}>
              {entry.sections.map((section, index) => (
                <EntrySection key={index} section={section} />
              ))}
            </ProseProvider>
            <LearnInLessonLink slug={entry.learnInLesson} manifest={manifest} />
            <RelatedEntries entries={relatedEntries(manifest, ref)} />
            <MethodologyNote
              hasFacts={facts.kind !== EntryFactsKind.None}
              reviewedAt={entry.reviewedAt}
              isOwnerRead={OWNER_READ_REFS.includes(ref)}
            />
            <KienThucCta />
          </div>
        </ReadingZone>
      </section>
    </main>
  );
}
