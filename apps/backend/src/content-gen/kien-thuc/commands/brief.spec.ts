import { KienThucBatch } from '../batches';
import { briefOutput } from './brief';

describe('briefOutput', () => {
  it('prints a page brief', () => {
    expect(briefOutput({ ref: 'sao/thien-co' })).toContain('# Brief');
  });

  it('lists a batch refs in plan order', () => {
    expect(briefOutput({ batch: KienThucBatch.Step01 })).toBe(
      ['bai/tu-vi-la-gi', 'bai/la-so-tu-vi-gom-nhung-gi', 'bai/am-duong-ngu-hanh-co-ban'].join(
        '\n',
      ),
    );
  });
});
