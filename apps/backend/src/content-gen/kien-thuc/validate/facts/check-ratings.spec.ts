import { ContentKind } from '@org/shared-contracts';
import type { SaoName } from '@org/shared-tu-vi';
import { checkRatings } from './check-ratings';
import { ClaimStatus, type FactSubject } from './fact-subject';

function sao(star: SaoName): FactSubject {
  return { kind: ContentKind.Sao, star };
}

describe('checkRatings', () => {
  it('accepts the engine ratings of Thiên Cơ in a list', () => {
    expect(
      checkRatings('Thiên Cơ miếu ở Thìn, Tuất, Mão, Dậu và hãm ở Dần, Hợi.', null).violations,
    ).toEqual([]);
  });

  it('accepts a contrast in one clause', () => {
    expect(checkRatings('Thiên Cơ hãm ở Dần nhưng sang Thìn lại miếu.', null).violations).toEqual(
      [],
    );
  });

  it('rejects a rating the engine contradicts', () => {
    const { violations } = checkRatings('Thiên Cơ miếu ở Dần.', null);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain('Thiên Cơ');
    expect(violations[0]).toContain('Dần');
    expect(violations[0]).toContain('hãm');
  });

  it('binds to the entry star when the clause names none', () => {
    expect(checkRatings('Sao này miếu ở Dần.', sao('Thiên Cơ')).violations).toHaveLength(1);
  });

  it('rejects any rating claim for a star the tables leave out', () => {
    expect(checkRatings('Tả Phù miếu ở Thìn.', sao('Tả Phù')).violations).toHaveLength(1);
    expect(checkRatings('Tả Phù đắc địa thì tốt.', sao('Tả Phù')).violations).toHaveLength(1);
    expect(checkRatings('Tả Phù không miếu cũng không hãm.', sao('Tả Phù')).violations).toEqual([]);
  });

  it('rejects a rating claim for any of the four hóa', () => {
    for (const hoa of ['Hóa Lộc', 'Hóa Quyền', 'Hóa Khoa', 'Hóa Kỵ'] as const) {
      const { violations } = checkRatings(`${hoa} miếu ở Dần.`, sao(hoa));
      expect(violations).toEqual([`${hoa} không có bậc, nhưng câu ghi miếu`]);
    }
  });

  it('reads the scale name as a name, not a claim', () => {
    const subject = sao('Tả Phù');
    expect(checkRatings('Tả Phù không có bậc miếu hãm.', subject).violations).toEqual([]);
    expect(checkRatings('Tả Phù không có bậc miếu hay hãm.', subject).violations).toEqual([]);
    expect(
      checkRatings('Miếu, vượng, đắc địa, bình hòa, hãm là năm bậc.', subject).violations,
    ).toEqual([]);
  });

  it('rejects a cell the engine leaves empty', () => {
    const empty = checkRatings('Địa Kiếp hãm ở Tý.', null);
    expect(empty.violations.some((v) => v.includes('không có bậc tại Tý'))).toBe(true);
    expect(checkRatings('Địa Kiếp đắc địa ở Dần.', null).violations).toEqual([]);
  });

  it('rejects Văn Xương at Mão, a cell the engine leaves empty', () => {
    expect(checkRatings('Văn Xương đắc địa ở Mão.', null).violations).toEqual([
      'Văn Xương không có bậc tại Mão',
    ]);
  });

  it('never binds the art to the star', () => {
    expect(
      checkRatings('Trong lá số tử vi, miếu ở Dần là điều đáng mừng.', null).violations,
    ).toEqual([]);
  });

  it('ignores thịnh vượng, cung Thân and Thân cư', () => {
    const subject = sao('Thái Dương');
    expect(checkRatings('Cuộc sống thịnh vượng ở Tý.', subject).violations).toEqual([]);
    expect(checkRatings('Thái Dương miếu, cung Thân sáng.', subject).violations).toEqual([]);
    expect(
      checkRatings('Lá số có Thân cư Mệnh, Thái Dương miếu thì càng sáng.', subject).violations,
    ).toEqual([]);
  });

  it('skips a clause that names two stars and says why', () => {
    const result = checkRatings('Thiên Cơ và Thái Âm miếu ở Dần.', null);
    expect(result.violations).toEqual([]);
    expect(result.claims).toHaveLength(1);
    expect(result.claims[0].status).toBe(ClaimStatus.Skipped);
    expect(result.claims[0].reason).toBe('hai sao');
  });

  it('does not read the "Không" in Địa Không as a negation', () => {
    const { violations, claims } = checkRatings(
      'Địa Không đắc địa tại Dần, Tị, Thân, Hợi.',
      sao('Địa Không'),
    );
    expect(violations).toEqual([]);
    expect(claims[0].status).toBe(ClaimStatus.Checked);
  });

  it('checks Địa Không ratings once the name is no longer a negation', () => {
    expect(checkRatings('Địa Không đắc địa tại Tý.', sao('Địa Không')).violations).toHaveLength(1);
  });

  it('still reads a real negation after Địa Không', () => {
    const { claims } = checkRatings('Địa Không không hãm ở Dần.', sao('Địa Không'));
    expect(claims[0].status).toBe(ClaimStatus.Skipped);
  });
});
