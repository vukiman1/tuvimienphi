import { ContentKind } from '@org/shared-contracts';
import {
  entryPath,
  indexPath,
  KienThucPageType,
  lessonPath,
  refPath,
  shareImagePath,
} from './kien-thuc-paths';

describe('kien-thuc paths', () => {
  it('puts lessons at the top level and entries under their kind', () => {
    expect(lessonPath('tu-vi-la-gi')).toBe('/kien-thuc/tu-vi-la-gi');
    expect(entryPath(ContentKind.ThuatNgu, 'can')).toBe('/kien-thuc/thuat-ngu/can');
    expect(refPath('bai/tuan-va-triet')).toBe('/kien-thuc/tuan-va-triet');
    expect(refPath('sao/thien-co')).toBe('/kien-thuc/sao/thien-co');
    expect(indexPath(ContentKind.Sao)).toBe('/kien-thuc/sao');
  });

  it('refuses a ref that is not a page ref', () => {
    expect(() => refPath('sao/Thien Co' as never)).toThrow('sao/Thien Co');
  });

  it('serves share images outside the kiến thức path', () => {
    expect(shareImagePath(KienThucPageType.Star)).toBe('/og/kien-thuc/sao.jpg');
  });
});
