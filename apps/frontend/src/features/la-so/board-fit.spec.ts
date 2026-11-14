import { BoardVariant, FULL_BOARD_MIN_WIDTH, boardScaleFor, boardVariantFor } from './board-fit';

const STAR_NAME_FONT_PX = 12;
const MIN_SCREEN_FONT_PX = 10;

describe('board fit', () => {
  it('uses the compact board under 680', () => {
    expect(boardVariantFor(679)).toBe(BoardVariant.Compact);
    expect(boardVariantFor(FULL_BOARD_MIN_WIDTH)).toBe(BoardVariant.Full);
  });

  it('keeps star names at 10 px or more on screen', () => {
    expect(STAR_NAME_FONT_PX * boardScaleFor(FULL_BOARD_MIN_WIDTH)).toBeGreaterThanOrEqual(
      MIN_SCREEN_FONT_PX,
    );
  });

  it('scales the full board down to fit and never up', () => {
    expect(boardScaleFor(406)).toBe(0.5);
    expect(boardScaleFor(1600)).toBe(1);
  });
});
