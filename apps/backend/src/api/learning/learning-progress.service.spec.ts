import { LearningProgressLimitError } from './learning.errors';
import { LearningProgressService } from './learning-progress.service';
import { LearningProgressStore, ProgressSaveOutcome } from './port/learning-progress.store';

function serviceWith(store: {
  listSlugs: jest.Mock;
  saveWithinLimit: jest.Mock;
}): LearningProgressService {
  return new LearningProgressService(store as unknown as LearningProgressStore);
}

describe('LearningProgressService', () => {
  it("lists the reader's slugs from the store", async () => {
    const store = {
      listSlugs: jest.fn().mockResolvedValue(['tu-vi-la-gi']),
      saveWithinLimit: jest.fn(),
    };

    await expect(serviceWith(store).list('user-1')).resolves.toEqual(['tu-vi-la-gi']);
    expect(store.listSlugs).toHaveBeenCalledWith('user-1');
  });

  it('saves within the per-user cap', async () => {
    const store = {
      listSlugs: jest.fn(),
      saveWithinLimit: jest.fn().mockResolvedValue(ProgressSaveOutcome.Saved),
    };

    await serviceWith(store).save('user-1', ['a']);

    expect(store.saveWithinLimit).toHaveBeenCalledWith('user-1', ['a'], 200);
  });

  it('turns a full account into LearningProgressLimitError', async () => {
    const store = {
      listSlugs: jest.fn(),
      saveWithinLimit: jest.fn().mockResolvedValue(ProgressSaveOutcome.OverLimit),
    };

    await expect(serviceWith(store).save('user-1', ['a'])).rejects.toBeInstanceOf(
      LearningProgressLimitError,
    );
  });
});
