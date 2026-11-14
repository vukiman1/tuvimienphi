import { BoardKey, cungIndexInDirection, ringNeighbour } from './board-navigation';

const TI = 5;
const NGO = 6;
const THIN = 4;
const MAO = 3;
const LAST_CUNG = 11;
const FIRST_CUNG = 0;

describe('cungIndexInDirection', () => {
  it('moves right along the top row', () => {
    expect(cungIndexInDirection(TI, BoardKey.Right)).toBe(NGO);
  });

  it('moves down the left column', () => {
    expect(cungIndexInDirection(TI, BoardKey.Down)).toBe(THIN);
  });

  it('stays put when the next cell is the thiên bàn', () => {
    expect(cungIndexInDirection(MAO, BoardKey.Right)).toBe(MAO);
  });

  it('stays put at the board edge', () => {
    expect(cungIndexInDirection(TI, BoardKey.Up)).toBe(TI);
  });
});

describe('ringNeighbour', () => {
  it('ring neighbours wrap', () => {
    expect(ringNeighbour(LAST_CUNG, 1)).toBe(FIRST_CUNG);
    expect(ringNeighbour(FIRST_CUNG, -1)).toBe(LAST_CUNG);
  });
});
