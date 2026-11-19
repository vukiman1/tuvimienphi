import { FIXTURE_SOURCE } from '../__fixtures__/fixture-source';
import { KienThucPageStatus } from './kien-thuc-page-status';
import { loadLessonPage } from './lesson-route';

describe('loadLessonPage', () => {
  it('finds a published lesson', async () => {
    const data = await loadLessonPage('tu-vi-la-gi', FIXTURE_SOURCE);

    expect(data.status).toBe(KienThucPageStatus.Found);
  });

  it.each(['y-nghia-chinh-tinh', 'khong-co', 'sao'])(
    'does not find an unpublished, unknown or reserved slug: %s',
    async (slug) => {
      const data = await loadLessonPage(slug, FIXTURE_SOURCE);

      expect(data.status).toBe(KienThucPageStatus.NotFound);
    },
  );

  it('loads nothing for a reserved slug', async () => {
    const loadManifest = jest.fn(FIXTURE_SOURCE.loadManifest);
    const loadLesson = jest.fn(FIXTURE_SOURCE.loadLesson);

    await loadLessonPage('sao', { ...FIXTURE_SOURCE, loadManifest, loadLesson });

    expect(loadManifest).not.toHaveBeenCalled();
    expect(loadLesson).not.toHaveBeenCalled();
  });
});
