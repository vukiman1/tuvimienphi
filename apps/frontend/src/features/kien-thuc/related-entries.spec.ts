import { EntryGroup, ContentKind } from '@org/shared-contracts';
import type { KienThucManifest, ManifestEntry } from '@org/shared-contracts';
import { FIXTURE_SOURCE } from './__fixtures__/fixture-source';
import { RELATED_ENTRY_COUNT, relatedEntries } from './related-entries';

const MANIFEST: KienThucManifest = FIXTURE_SOURCE.loadManifest();
const STAR_COUNT = 10;

function starEntry(index: number): ManifestEntry {
  return {
    kind: ContentKind.Sao,
    group: EntryGroup.PhuTinh,
    slug: `sao-${index}`,
    title: `Sao ${index}`,
    learnInLesson: 'phu-tinh-thuong-gap',
    reviewedAt: '2026-01-01',
  };
}

describe('relatedEntries', () => {
  it('lists the following entries of the same kind, wrapping', () => {
    expect(relatedEntries(MANIFEST, 'sao/ta-phu').map((entry) => entry.slug)).toEqual([
      'dia-kiep',
      'thien-co',
    ]);
  });

  it('never lists the entry itself or another kind', () => {
    const related = relatedEntries(MANIFEST, 'sao/ta-phu');
    expect(related.every((entry) => entry.kind === ContentKind.Sao)).toBe(true);
    expect(related.some((entry) => entry.slug === 'ta-phu')).toBe(false);
  });

  it('stops at six', () => {
    const manifest: KienThucManifest = {
      steps: [],
      entries: Array.from({ length: STAR_COUNT }, (_, index) => starEntry(index)),
    };
    expect(relatedEntries(manifest, 'sao/sao-0')).toHaveLength(RELATED_ENTRY_COUNT);
  });
});
