import { ContentKind } from '@org/shared-contracts';
import type { KienThucManifest } from '@org/shared-contracts';
import { FIXTURE_SOURCE } from './__fixtures__/fixture-source';
import { EMPTY_MANIFEST } from './content-source';
import {
  entriesOfKind,
  groupsWithEntries,
  isPublished,
  publishedLesson,
  publishedTitle,
  stepsWithLessons,
} from './published-pages';

const MANIFEST: KienThucManifest = FIXTURE_SOURCE.loadManifest();

describe('published pages', () => {
  it('numbers lessons within the published lessons of their step', () => {
    expect(publishedLesson(MANIFEST, '12-cung-tu-vi')).toMatchObject({
      step: 2,
      position: 1,
      stepLessonCount: 1,
    });
    expect(publishedLesson(MANIFEST, 'la-so-tu-vi-gom-nhung-gi')).toMatchObject({
      step: 1,
      position: 2,
      stepLessonCount: 3,
    });
    expect(publishedLesson(MANIFEST, 'y-nghia-chinh-tinh')).toBeUndefined();
  });

  it('drops steps with no published lesson', () => {
    expect(stepsWithLessons(MANIFEST).map((step) => step.step)).toEqual([1, 2, 6]);
  });

  it('knows which refs are published', () => {
    expect(isPublished(MANIFEST, 'sao/thien-co')).toBe(true);
    expect(isPublished(MANIFEST, 'bai/12-cung-tu-vi')).toBe(true);
    expect(isPublished(MANIFEST, 'sao/tu-vi')).toBe(false);
    expect(isPublished(MANIFEST, 'sao/hoa-loc')).toBe(false);
    expect(isPublished(MANIFEST, 'bai/y-nghia-chinh-tinh')).toBe(false);
    expect(publishedTitle(MANIFEST, 'sao/thien-co')).toBe('Sao Thiên Cơ');
  });

  it('lists the groups that have entries, in contract order', () => {
    expect(groupsWithEntries(MANIFEST, ContentKind.Sao)).toEqual(['chinh-tinh', 'phu-tinh']);
    expect(groupsWithEntries(MANIFEST, ContentKind.ThuatNgu)).toEqual(['ngu-hanh', 'thuat-ngu']);
    expect(entriesOfKind(MANIFEST, ContentKind.Cung)).toHaveLength(2);
    for (const kind of [ContentKind.Sao, ContentKind.Cung, ContentKind.ThuatNgu] as const) {
      expect(groupsWithEntries(EMPTY_MANIFEST, kind)).toEqual([]);
    }
  });
});
