import { ContentKind } from '@org/shared-contracts';
import type { EntryKind } from '@org/shared-contracts';
import { FIXTURE_SOURCE } from '../__fixtures__/fixture-source';
import { loadEntryPage } from './entry-route';
import { KienThucPageStatus } from './kien-thuc-page-status';

describe('loadEntryPage', () => {
  it('finds a published entry of its kind only', async () => {
    const found = await loadEntryPage(ContentKind.Sao, 'thien-co', FIXTURE_SOURCE);
    const missing: readonly (readonly [EntryKind, string])[] = [
      [ContentKind.Cung, 'thien-co'],
      [ContentKind.Sao, 'tu-vi'],
      [ContentKind.Sao, 'khong-co'],
    ];
    const statuses = await Promise.all(
      missing.map(async ([kind, slug]) => (await loadEntryPage(kind, slug, FIXTURE_SOURCE)).status),
    );

    expect(found.status).toBe(KienThucPageStatus.Found);
    expect(statuses).toEqual(missing.map(() => KienThucPageStatus.NotFound));
  });
});
