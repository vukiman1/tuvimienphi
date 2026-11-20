import { learningProgressService } from '@/services/learning-progress-service';
import { clearLocalProgress, markLessonRead, readLocalProgress } from './local-progress-store';
import { mergeDeviceProgress } from './merge-device-progress';

jest.mock('@/services/learning-progress-service', () => ({
  learningProgressService: { save: jest.fn(), list: jest.fn() },
}));

const service = jest.mocked(learningProgressService);

beforeEach(() => {
  window.localStorage.clear();
  clearLocalProgress();
  service.save.mockReset().mockResolvedValue(undefined);
  service.list.mockReset().mockResolvedValue({ slugs: [] });
});

describe('mergeDeviceProgress', () => {
  it("sends the device's lessons to the account, then reads the account back", async () => {
    markLessonRead('tu-vi-la-gi');
    markLessonRead('12-cung-tu-vi');
    service.list.mockResolvedValue({ slugs: ['12-cung-tu-vi', 'tu-vi-la-gi'] });

    const result = await mergeDeviceProgress();

    expect(service.save).toHaveBeenCalledWith(['12-cung-tu-vi', 'tu-vi-la-gi']);
    expect(service.save.mock.invocationCallOrder[0]).toBeLessThan(
      service.list.mock.invocationCallOrder[0],
    );
    expect([...result].sort()).toEqual(['12-cung-tu-vi', 'tu-vi-la-gi']);
  });

  it('clears the device once the account holds its progress', async () => {
    markLessonRead('tu-vi-la-gi');

    await mergeDeviceProgress();

    expect(readLocalProgress().size).toBe(0);
  });

  it('keeps a lesson read during the merge for the next one', async () => {
    markLessonRead('tu-vi-la-gi');
    let releaseSave = (): void => undefined;
    service.save.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          releaseSave = () => resolve();
        }),
    );

    const merge = mergeDeviceProgress();
    markLessonRead('cung-menh-va-cung-than');
    releaseSave();
    await merge;

    expect(readLocalProgress().has('cung-menh-va-cung-than')).toBe(true);
  });

  it('leaves the device untouched when saving fails', async () => {
    markLessonRead('tu-vi-la-gi');
    const failure = new Error('network');
    service.save.mockRejectedValue(failure);

    await expect(mergeDeviceProgress()).rejects.toBe(failure);
    expect(readLocalProgress().has('tu-vi-la-gi')).toBe(true);
  });

  it('skips the save when the device holds nothing', async () => {
    await mergeDeviceProgress();

    expect(service.save).not.toHaveBeenCalled();
    expect(service.list).toHaveBeenCalled();
  });

  it('sends every lesson on the device in requests of at most 50', async () => {
    const slugs = Array.from({ length: 60 }, (_, index) => `lesson-${index}`);
    slugs.forEach(markLessonRead);

    await mergeDeviceProgress();

    expect(service.save).toHaveBeenCalledTimes(2);
    expect(service.save.mock.calls[0][0]).toHaveLength(50);
    expect(service.save.mock.calls[1][0]).toHaveLength(10);
    expect(readLocalProgress().size).toBe(0);
  });
});
