import { readdirSync } from 'node:fs';
import { ContentKind, pageRef, parsePageRef } from '@org/shared-contracts';
import type { PageRef } from '@org/shared-contracts';
import { KIEN_THUC_ENTRIES, plannedPage } from '@org/shared-kien-thuc';
import { FIXTURE_SOURCE } from './fixture-source';

const FIXTURE_DIRECTORY = __dirname;
const NON_PAGE_FIXTURES: readonly string[] = ['manifest.json', 'search-index.json'];
const LINK_PATTERN = /\[\[([a-z-]+\/[a-z0-9-]+)\|[^\]|]{1,40}\]\]/gu;
const JSON_EXTENSION = '.json';

const MANIFEST = FIXTURE_SOURCE.loadManifest();

function manifestRefs(): readonly PageRef[] {
  return [
    ...MANIFEST.steps.flatMap((step) =>
      step.lessons.map((lesson) => pageRef(ContentKind.Bai, lesson.slug)),
    ),
    ...MANIFEST.entries.map((entry) => pageRef(entry.kind, entry.slug)),
  ];
}

function fixtureFileRefs(): readonly PageRef[] {
  const kinds = Object.values(ContentKind);
  return readdirSync(FIXTURE_DIRECTORY)
    .filter((name) => name.endsWith(JSON_EXTENSION) && !NON_PAGE_FIXTURES.includes(name))
    .map((name) => name.slice(0, -JSON_EXTENSION.length))
    .map((base) => {
      const kind = kinds.find((candidate) => base.startsWith(`${candidate}-`));
      return pageRef(kind ?? ContentKind.Bai, base.slice((kind?.length ?? 0) + 1));
    });
}

function toPageRef(text: string): PageRef | undefined {
  const parsed = parsePageRef(text);
  return parsed ? pageRef(parsed.kind, parsed.slug) : undefined;
}

function linkedRefsOf(file: unknown): readonly (PageRef | undefined)[] {
  return [...JSON.stringify(file).matchAll(LINK_PATTERN)].map((match) => toPageRef(match[1]));
}

async function linkedRefs(): Promise<readonly (PageRef | undefined)[]> {
  const lessons = await Promise.all(
    MANIFEST.steps.flatMap((step) =>
      step.lessons.map((lesson) => FIXTURE_SOURCE.loadLesson(lesson.slug)),
    ),
  );
  const entries = await Promise.all(
    MANIFEST.entries.map((entry) => FIXTURE_SOURCE.loadEntry(entry.kind, entry.slug)),
  );
  return [...lessons, ...entries].flatMap(linkedRefsOf);
}

describe('kien-thuc fixtures', () => {
  it('uses only planned pages', async () => {
    const refs = [...manifestRefs(), ...(await linkedRefs())];
    expect(refs.filter((ref) => !ref || !plannedPage(ref))).toEqual([]);
  });

  it('orders entries as approve does', () => {
    const planOrder = KIEN_THUC_ENTRIES.map((entry) => pageRef(entry.kind, entry.slug));
    const manifestOrder = MANIFEST.entries.map((entry) => pageRef(entry.kind, entry.slug));
    expect(manifestOrder).toEqual(planOrder.filter((ref) => manifestOrder.includes(ref)));
  });

  it('lists each fixture file once in the manifest and the index', async () => {
    const indexRefs = (await FIXTURE_SOURCE.loadSearchIndex()).map((item) =>
      pageRef(item.kind, item.slug),
    );
    const expected = [...manifestRefs()].sort();
    expect([...fixtureFileRefs()].sort()).toEqual(expected);
    expect([...indexRefs].sort()).toEqual(expected);
  });
});
