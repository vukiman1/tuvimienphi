import { UnplannedContentError } from '../errors';
import {
  CAN_ENTRY,
  entryFile,
  HANH_KIM_ENTRY,
  HOA_LOC_ENTRY,
  lessonFile,
  MENH_ENTRY,
  TA_PHU_ENTRY,
  THIEN_CO_ENTRY,
} from '../store/content-fixtures';
import { EntryGroup, ContentKind } from '@org/shared-contracts';
import type { ContentFiles } from '../store/content-store';
import { buildManifest } from './build-manifest';

describe('buildManifest', () => {
  it('lists all six steps and only the approved lessons in order', () => {
    const files: ContentFiles = {
      lessons: [
        lessonFile('la-so-tu-vi-gom-nhung-gi', 1, 2, 'Một lá số gồm những gì'),
        lessonFile('tu-vi-la-gi', 1, 1, 'Tử vi là gì'),
      ],
      entries: [],
    };
    const manifest = buildManifest(files);
    expect(manifest.steps).toHaveLength(6);
    expect(manifest.steps[0].lessons.map((lesson) => lesson.slug)).toEqual([
      'tu-vi-la-gi',
      'la-so-tu-vi-gom-nhung-gi',
    ]);
    expect(manifest.steps.slice(1).every((step) => step.lessons.length === 0)).toBe(true);
  });

  it('orders entries by the plan', () => {
    const files: ContentFiles = {
      lessons: [],
      entries: [CAN_ENTRY, HANH_KIM_ENTRY, MENH_ENTRY, TA_PHU_ENTRY, HOA_LOC_ENTRY, THIEN_CO_ENTRY],
    };
    expect(buildManifest(files).entries.map((entry) => entry.slug)).toEqual([
      'thien-co',
      'hoa-loc',
      'ta-phu',
      'menh',
      'hanh-kim',
      'can',
    ]);
  });

  it('carries no summaries or aliases', () => {
    const files: ContentFiles = { lessons: [], entries: [TA_PHU_ENTRY] };
    const serialised = JSON.stringify(buildManifest(files));
    expect(serialised).not.toContain('summary');
    expect(serialised).not.toContain('aliases');
  });

  it('refuses a file the plan does not know', () => {
    const files: ContentFiles = {
      lessons: [],
      entries: [
        entryFile(ContentKind.Sao, EntryGroup.ChinhTinh, 'khong-co', 'Lạ', 'y-nghia-chinh-tinh'),
      ],
    };
    expect(() => buildManifest(files)).toThrow(UnplannedContentError);
  });
});
