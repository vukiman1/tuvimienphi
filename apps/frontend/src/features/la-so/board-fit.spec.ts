import { BoardVariant, boardScaleFor, boardVariantFor } from './board-fit';

describe('board fit', () => {
  it('uses the compact board below 640 px of container', () => {
    expect(boardVariantFor(639)).toBe(BoardVariant.Compact);
    expect(boardVariantFor(640)).toBe(BoardVariant.Full);
  });

  it('scales the full board down to fit and never up', () => {
    expect(boardScaleFor(406)).toBe(0.5);
    expect(boardScaleFor(1600)).toBe(1);
  });
});
