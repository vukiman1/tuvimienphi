import { checkedClaim, ClaimStatus, type FactCheckResult } from './fact-subject';
import { claimClausesOf } from './claim-clauses';

describe('claimClausesOf', () => {
  it('lists a clause no checker read as skipped', () => {
    const listed = claimClausesOf('Khoản tiền lớn.', []);
    expect(listed).toHaveLength(1);
    expect(listed[0].status).toBe(ClaimStatus.Skipped);
    expect(listed[0].reason).toContain('không checker');
  });

  it('orders skipped clauses before checked ones', () => {
    const results: readonly FactCheckResult[] = [
      { violations: [], claims: [checkedClaim('Thiên Cơ miếu ở Thìn.')] },
    ];
    const listed = claimClausesOf('Thiên Cơ miếu ở Thìn. Có nhiều tiền.', results);
    expect(listed).toHaveLength(2);
    expect(listed[0].status).toBe(ClaimStatus.Skipped);
    expect(listed[1].status).toBe(ClaimStatus.Checked);
  });
});
