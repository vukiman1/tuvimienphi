import { ContentKind } from '@org/shared-contracts';
import type { CungName } from '@org/shared-tu-vi';
import { checkRelations } from './check-relations';
import { ClaimStatus, type FactSubject } from './fact-subject';

function cung(name: CungName): FactSubject {
  return { kind: ContentKind.Cung, cung: name };
}

describe('checkRelations', () => {
  it('accepts Mệnh, Tài Bạch, Quan Lộc as one tam hợp', () => {
    expect(checkRelations('Mệnh tam hợp với Tài Bạch và Quan Lộc.', null).violations).toEqual([]);
  });

  it('rejects Mệnh in tam hợp with Phu Thê', () => {
    expect(checkRelations('Mệnh tam hợp với Phu Thê.', null).violations.length).toBeGreaterThan(0);
  });

  it('accepts Mệnh đối cung Thiên Di and rejects Mệnh đối cung Tật Ách', () => {
    expect(checkRelations('Mệnh đối cung Thiên Di.', null).violations).toEqual([]);
    expect(checkRelations('Mệnh đối cung Tật Ách.', null).violations.length).toBeGreaterThan(0);
  });

  it('binds a cung entry clause to its palace', () => {
    expect(checkRelations('Đối cung là Quan Lộc.', cung('Phu Thê')).violations).toEqual([]);
    expect(
      checkRelations('Đối cung là Tài Bạch.', cung('Phu Thê')).violations.length,
    ).toBeGreaterThan(0);
  });

  it('checks chi relations for the tuổi term', () => {
    expect(checkRelations('Thân, Tý, Thìn tam hợp.', null).violations).toEqual([]);
    expect(checkRelations('Tý lục xung Ngọ.', null).violations).toEqual([]);
    expect(checkRelations('Tý lục xung Mùi.', null).violations.length).toBeGreaterThan(0);
    expect(checkRelations('Tý nhị hợp Sửu.', null).violations).toEqual([]);
  });

  it('skips a list longer than one relation holds', () => {
    const result = checkRelations('Các cặp lục xung là Tý Ngọ, Sửu Mùi, Dần Thân.', null);
    expect(result.violations).toEqual([]);
    expect(result.claims.every((claim) => claim.status === ClaimStatus.Skipped)).toBe(true);
  });

  it('skips a clause mixing relations', () => {
    expect(checkRelations('Mệnh đối cung Thiên Di và tam hợp Tài Bạch.', null).violations).toEqual(
      [],
    );
  });
});
