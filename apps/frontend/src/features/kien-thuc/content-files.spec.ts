import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  ContentKind,
  KIEN_THUC_MANIFEST_FILE,
  KIEN_THUC_SEARCH_INDEX_FILE,
  pageRef,
  parsePageRef,
} from '@org/shared-contracts';
import type {
  EntryFile,
  KienThucManifest,
  KienThucSearchItem,
  LessonFile,
  PageRef,
} from '@org/shared-contracts';
import { plannedPage } from '@org/shared-kien-thuc';
import { OWNER_READ_REFS } from './owner-read-refs';

const CONTENT_DIRECTORY = join(__dirname, 'content');
const MANIFEST_PATH = join(CONTENT_DIRECTORY, KIEN_THUC_MANIFEST_FILE);
const SEARCH_INDEX_PATH = join(CONTENT_DIRECTORY, KIEN_THUC_SEARCH_INDEX_FILE);
const JSON_EXTENSION = '.json';
const LINK_PATTERN = /\[\[([a-z-]+)\/([a-z0-9-]+)\|([^\]|]{1,40})\]\]/gu;
const LINK_OPEN = '[[';
const HAN_PATTERN = /\p{Script=Han}/u;

type ContentFile = LessonFile | EntryFile;

interface LoadedContentFile {
  readonly ref: PageRef;
  readonly file: ContentFile;
}

const hasContent = existsSync(MANIFEST_PATH);
const describeContent = hasContent ? describe : describe.skip;

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function loadContentFiles(): readonly LoadedContentFile[] {
  return Object.values(ContentKind).flatMap((kind) => {
    const directory = join(CONTENT_DIRECTORY, kind);
    if (!existsSync(directory)) {
      return [];
    }
    return readdirSync(directory)
      .filter((name) => name.endsWith(JSON_EXTENSION))
      .map((name) => ({
        ref: pageRef(kind, name.slice(0, -JSON_EXTENSION.length)),
        file: readJson(join(directory, name)) as ContentFile,
      }));
  });
}

function manifestTitles(manifest: KienThucManifest): ReadonlyMap<PageRef, string> {
  return new Map([
    ...manifest.steps.flatMap((step) =>
      step.lessons.map((lesson): [PageRef, string] => [
        pageRef(ContentKind.Bai, lesson.slug),
        lesson.title,
      ]),
    ),
    ...manifest.entries.map((entry): [PageRef, string] => [
      pageRef(entry.kind, entry.slug),
      entry.title,
    ]),
  ]);
}

function paragraphsOf(file: ContentFile): readonly string[] {
  return file.sections.flatMap((section) => section.paragraphs);
}

function plannedRefOf(text: string): boolean {
  const parsed = parsePageRef(text);
  return parsed !== null && plannedPage(pageRef(parsed.kind, parsed.slug)) !== undefined;
}

describeContent('kien-thuc content files', () => {
  const manifest = hasContent ? (readJson(MANIFEST_PATH) as KienThucManifest) : undefined;
  const files = hasContent ? loadContentFiles() : [];

  it('lists every content file in the manifest and nothing else', () => {
    const titles = manifestTitles(manifest as KienThucManifest);
    expect([...titles.keys()].sort()).toEqual(files.map((item) => item.ref).sort());
    for (const { ref, file } of files) {
      expect(titles.get(ref)).toBe(file.title);
    }
  });

  it('indexes every content file once', () => {
    const items = readJson(SEARCH_INDEX_PATH) as readonly KienThucSearchItem[];
    expect(items.map((item) => pageRef(item.kind, item.slug)).sort()).toEqual(
      files.map((item) => item.ref).sort(),
    );
    const summaries = new Map(items.map((item) => [pageRef(item.kind, item.slug), item.summary]));
    for (const { ref, file } of files) {
      expect(summaries.get(ref)).toBe(file.summary);
    }
  });

  it('links only to planned pages with whole link markup', () => {
    const unplanned: string[] = [];
    const broken: string[] = [];
    for (const { ref, file } of files) {
      for (const paragraph of paragraphsOf(file)) {
        const linked = [...paragraph.matchAll(LINK_PATTERN)];
        for (const match of linked) {
          if (!plannedRefOf(`${match[1]}/${match[2]}`)) {
            unplanned.push(`${ref} -> ${match[1]}/${match[2]}`);
          }
        }
        if (paragraph.replace(LINK_PATTERN, '').includes(LINK_OPEN)) {
          broken.push(ref);
        }
      }
    }
    expect(unplanned).toEqual([]);
    expect(broken).toEqual([]);
  });

  it('holds no Chinese characters', () => {
    const offenders = files.filter(({ file }) => HAN_PATTERN.test(JSON.stringify(file)));
    expect(offenders.map((item) => item.ref)).toEqual([]);
  });

  it('marks only planned refs as read by Kim An', () => {
    expect(OWNER_READ_REFS.filter((ref) => !plannedRefOf(ref))).toEqual([]);
  });
});
