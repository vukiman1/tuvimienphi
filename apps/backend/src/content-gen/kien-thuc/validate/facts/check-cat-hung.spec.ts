import { ContentKind } from '@org/shared-contracts';
import type { SaoName } from '@org/shared-tu-vi';
import { checkCatHung } from './check-cat-hung';
import { ClaimStatus, type FactSubject } from './fact-subject';

function sao(star: SaoName): FactSubject {
  return { kind: ContentKind.Sao, star };
}

describe('checkCatHung', () => {
  it('rejects calling Kình Dương a cát tinh', () => {
    expect(checkCatHung('Kình Dương là cát tinh.', null).violations).toHaveLength(1);
  });

  it('rejects calling Lộc Tồn a hung tinh', () => {
    expect(checkCatHung('Lộc Tồn là hung tinh.', null).violations).toHaveLength(1);
  });

  it('accepts Hóa Kỵ as a hung tinh', () => {
    expect(checkCatHung('Hóa Kỵ là hung tinh.', null).violations).toEqual([]);
  });

  it('reads only the copular form', () => {
    const one = checkCatHung('Gặp Lộc Tồn, hung tinh bớt phần nào sức phá.', sao('Lộc Tồn'));
    const two = checkCatHung(
      'Thiên Khôi đi cùng hung tinh vẫn giữ được vai quý nhân.',
      sao('Thiên Khôi'),
    );
    expect(one.violations).toEqual([]);
    expect(one.claims.every((claim) => claim.status === ClaimStatus.Skipped)).toBe(true);
    expect(two.violations).toEqual([]);
    expect(two.claims.every((claim) => claim.status === ClaimStatus.Skipped)).toBe(true);
  });

  it('does not judge chính tinh', () => {
    expect(checkCatHung('Thất Sát là hung tinh.', null).violations).toEqual([]);
  });
});
