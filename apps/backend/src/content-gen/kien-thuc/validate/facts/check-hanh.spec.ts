import { ContentKind } from '@org/shared-contracts';
import type { SaoName } from '@org/shared-tu-vi';
import { checkHanh } from './check-hanh';
import type { FactSubject } from './fact-subject';

function sao(star: SaoName): FactSubject {
  return { kind: ContentKind.Sao, star };
}

describe('checkHanh', () => {
  it('accepts Thiên Cơ hành Mộc', () => {
    expect(checkHanh('Thiên Cơ thuộc hành Mộc.', null).violations).toEqual([]);
  });

  it('rejects Thiên Cơ thuộc hành Kim and names Mộc', () => {
    const { violations } = checkHanh('Thiên Cơ thuộc hành Kim.', null);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain('Mộc');
  });

  it('binds to the entry star', () => {
    expect(checkHanh('Sao này thuộc hành Thủy.', sao('Hóa Lộc')).violations).toHaveLength(1);
  });

  it('skips a clause comparing a star hành with a palace hành', () => {
    const { violations } = checkHanh('Thiên Cơ hành Mộc gặp cung hành Thổ.', null);
    expect(violations).toEqual([]);
  });
});
