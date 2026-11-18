import { ContentKind } from '@org/shared-contracts';
import type { SaoName } from '@org/shared-tu-vi';
import { checkChom } from './check-chom';
import { ClaimStatus, type FactSubject } from './fact-subject';

function sao(star: SaoName): FactSubject {
  return { kind: ContentKind.Sao, star };
}

describe('checkChom', () => {
  it('accepts the six stars of chòm Tử Vi in a list', () => {
    expect(
      checkChom(
        'Chòm Tử Vi gồm Tử Vi, Thiên Cơ, Thái Dương, Vũ Khúc, Thiên Đồng, Liêm Trinh.',
        null,
      ).violations,
    ).toEqual([]);
  });

  it('rejects Thất Sát in chòm Tử Vi', () => {
    expect(checkChom('Chòm Tử Vi có Thất Sát.', null).violations).toHaveLength(1);
  });

  it('does not read chòm Thiên Phủ as the star Thiên Phủ', () => {
    expect(checkChom('Chòm Thiên Phủ gồm tám sao chính.', null).violations).toEqual([]);
  });

  it('accepts a negated membership', () => {
    expect(checkChom('Thất Sát không thuộc chòm Tử Vi.', null).violations).toEqual([]);
  });

  it('binds to the entry star', () => {
    expect(checkChom('Sao này đứng trong chòm Tử Vi.', sao('Phá Quân')).violations).toHaveLength(1);
  });

  it('does not bind a chòm claim about another star to the entry star', () => {
    const { violations, claims } = checkChom(
      'Nếu ô ấy có thêm một chính tinh khác, sao đi cùng thuộc chòm Thiên Phủ.',
      sao('Thiên Cơ'),
    );
    expect(violations).toEqual([]);
    expect(claims[0].status).toBe(ClaimStatus.Skipped);
  });
});
