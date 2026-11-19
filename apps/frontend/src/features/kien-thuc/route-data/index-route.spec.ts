import { ContentKind } from '@org/shared-contracts';
import type { KienThucManifest } from '@org/shared-contracts';
import { FIXTURE_SOURCE } from '../__fixtures__/fixture-source';
import type { KienThucContentSource } from '../content-source';
import { loadIndexPage } from './index-route';
import { KienThucPageStatus } from './kien-thuc-page-status';
import { MissingIndexSummaryError } from './missing-index-summary-error';

function sourceWithManifest(
  transform: (manifest: KienThucManifest) => KienThucManifest,
): KienThucContentSource {
  return { ...FIXTURE_SOURCE, loadManifest: () => transform(FIXTURE_SOURCE.loadManifest()) };
}

describe('loadIndexPage', () => {
  it('groups published entries with their index summaries', async () => {
    const data = await loadIndexPage(ContentKind.Sao, FIXTURE_SOURCE);

    if (data.status !== KienThucPageStatus.Found) {
      throw new Error('The sao index was not found');
    }
    expect(
      data.groups.map(({ group, tiles }) => [
        group,
        tiles.map(({ entry, summary }) => [entry.slug, summary]),
      ]),
    ).toEqual([
      ['chinh-tinh', [['thien-co', 'Tóm tắt mẫu của trang Sao Thiên Cơ.']]],
      [
        'phu-tinh',
        [
          ['ta-phu', 'Tóm tắt mẫu của trang Sao Tả Phù.'],
          ['dia-kiep', 'Tóm tắt mẫu của trang Sao Địa Kiếp.'],
        ],
      ],
    ]);
  });

  it('does not find a kind with no published entry', async () => {
    const source = sourceWithManifest((manifest) => ({
      ...manifest,
      entries: manifest.entries.filter((entry) => entry.kind !== ContentKind.Cung),
    }));

    const data = await loadIndexPage(ContentKind.Cung, source);

    expect(data.status).toBe(KienThucPageStatus.NotFound);
  });

  it('refuses a published entry that the search index does not describe', async () => {
    const source: KienThucContentSource = {
      ...FIXTURE_SOURCE,
      loadSearchIndex: () => Promise.resolve([]),
    };

    await expect(loadIndexPage(ContentKind.Sao, source)).rejects.toThrow(
      new MissingIndexSummaryError('sao/thien-co'),
    );
  });
});
