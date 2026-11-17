import { KIEN_THUC_ENTRIES, KIEN_THUC_LESSONS, plannedRefOf } from '@org/shared-kien-thuc';
import { allBatches, KienThucBatch, pagesOfBatch } from './batches';

describe('batches', () => {
  it('splits the plan into thirteen batches that cover every page once', () => {
    const batches = allBatches();
    expect(batches).toHaveLength(13);
    const refs = batches.flatMap((batch) => pagesOfBatch(batch).map((page) => plannedRefOf(page)));
    expect(new Set(refs).size).toBe(refs.length);
    expect(refs).toHaveLength(KIEN_THUC_LESSONS.length + KIEN_THUC_ENTRIES.length);
  });

  it('orders a step batch by lesson order', () => {
    const lessons = pagesOfBatch(KienThucBatch.Step01);
    expect(lessons.map((page) => ('order' in page ? page.order : 0))).toEqual([1, 2, 3]);
  });

  it('puts seven chính tinh in each lot in plan order', () => {
    expect(pagesOfBatch(KienThucBatch.ChinhTinh1)).toHaveLength(7);
    expect(pagesOfBatch(KienThucBatch.ChinhTinh2)).toHaveLength(7);
  });
});
