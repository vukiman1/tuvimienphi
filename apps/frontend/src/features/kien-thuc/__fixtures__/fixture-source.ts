import { ContentKind, pageRef } from '@org/shared-contracts';
import type {
  EntryFile,
  EntryKind,
  KienThucManifest,
  KienThucSearchItem,
  LessonFile,
} from '@org/shared-contracts';
import type { KienThucContentSource } from '../content-source';
import lessonAmDuong from './bai-am-duong-ngu-hanh-co-ban.json';
import lessonCung from './bai-12-cung-tu-vi.json';
import lessonDocLaSo from './bai-doc-la-so-cua-chinh-ban.json';
import lessonLaSo from './bai-la-so-tu-vi-gom-nhung-gi.json';
import lessonTuVi from './bai-tu-vi-la-gi.json';
import palaceMenh from './cung-menh.json';
import palaceThienDi from './cung-thien-di.json';
import manifestFile from './manifest.json';
import searchIndexFile from './search-index.json';
import starDiaKiep from './sao-dia-kiep.json';
import starTaPhu from './sao-ta-phu.json';
import starThienCo from './sao-thien-co.json';
import termCan from './thuat-ngu-can.json';
import termCuc from './thuat-ngu-cuc.json';
import termHanhKim from './thuat-ngu-hanh-kim.json';

function narrowFixture<T>(json: unknown): T {
  return json as T;
}

const LESSONS: readonly LessonFile[] = [
  lessonTuVi,
  lessonLaSo,
  lessonAmDuong,
  lessonCung,
  lessonDocLaSo,
].map((json) => narrowFixture<LessonFile>(json));

const ENTRIES: readonly EntryFile[] = [
  starThienCo,
  starTaPhu,
  starDiaKiep,
  palaceMenh,
  palaceThienDi,
  termHanhKim,
  termCan,
  termCuc,
].map((json) => narrowFixture<EntryFile>(json));

const LESSONS_BY_REF: ReadonlyMap<string, LessonFile> = new Map(
  LESSONS.map((lesson) => [pageRef(ContentKind.Bai, lesson.slug), lesson]),
);

const ENTRIES_BY_REF: ReadonlyMap<string, EntryFile> = new Map(
  ENTRIES.map((entry) => [pageRef(entry.kind, entry.slug), entry]),
);

const MANIFEST: KienThucManifest = narrowFixture<KienThucManifest>(manifestFile);
const SEARCH_INDEX: readonly KienThucSearchItem[] =
  narrowFixture<readonly KienThucSearchItem[]>(searchIndexFile);

export const FIXTURE_SOURCE: KienThucContentSource = {
  loadManifest: () => MANIFEST,
  loadLesson: (slug: string) => Promise.resolve(LESSONS_BY_REF.get(pageRef(ContentKind.Bai, slug))),
  loadEntry: (kind: EntryKind, slug: string) =>
    Promise.resolve(ENTRIES_BY_REF.get(pageRef(kind, slug))),
  loadSearchIndex: () => Promise.resolve(SEARCH_INDEX),
};
