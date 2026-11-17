import { chisIn, starsIn } from './clause-mentions';

describe('starsIn', () => {
  it('does not read cung Phúc Đức as the star', () => {
    expect(starsIn('Cung Phúc Đức gặp hung tinh')).toEqual([]);
  });

  it('reads a pair alias as its two stars', () => {
    expect(starsIn('Không Kiếp đắc địa ở Dần').map((hit) => hit.name)).toEqual([
      'Địa Không',
      'Địa Kiếp',
    ]);
  });
});

describe('chisIn', () => {
  it('does not read Thân cư or cung Thân as the chi', () => {
    expect(chisIn('Thân cư Mệnh, cung Thân sáng, ở Thân thì vượng')).toHaveLength(1);
  });
});
