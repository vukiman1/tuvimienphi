import { planProgressSave, ProgressSaveKind } from './learning-progress-plan';

describe('planProgressSave', () => {
  it('inserts only the slugs the reader has not saved', () => {
    const plan = planProgressSave(new Set(['tu-vi-la-gi']), ['tu-vi-la-gi', '12-cung-tu-vi'], 200);

    expect(plan).toEqual({ kind: ProgressSaveKind.Insert, slugs: ['12-cung-tu-vi'] });
  });

  it('ignores a slug repeated in one request', () => {
    const plan = planProgressSave(new Set(), ['a', 'a', 'b'], 200);

    expect(plan).toEqual({ kind: ProgressSaveKind.Insert, slugs: ['a', 'b'] });
  });

  it('has nothing to do when every slug is already saved', () => {
    const plan = planProgressSave(new Set(['a', 'b']), ['a', 'b'], 200);

    expect(plan).toEqual({ kind: ProgressSaveKind.NothingNew });
  });

  it('accepts a resend at the cap', () => {
    const stored = new Set(Array.from({ length: 200 }, (_, index) => `lesson-${index}`));

    const plan = planProgressSave(stored, ['lesson-0'], 200);

    expect(plan).toEqual({ kind: ProgressSaveKind.NothingNew });
  });

  it('fills the cap exactly', () => {
    const stored = new Set(Array.from({ length: 199 }, (_, index) => `lesson-${index}`));

    const plan = planProgressSave(stored, ['one-more'], 200);

    expect(plan).toEqual({ kind: ProgressSaveKind.Insert, slugs: ['one-more'] });
  });

  it('refuses a request that would pass the cap', () => {
    const stored = new Set(Array.from({ length: 199 }, (_, index) => `lesson-${index}`));

    const plan = planProgressSave(stored, ['one-more', 'and-another'], 200);

    expect(plan).toEqual({
      kind: ProgressSaveKind.OverLimit,
      storedCount: 199,
      newCount: 2,
    });
  });
});
