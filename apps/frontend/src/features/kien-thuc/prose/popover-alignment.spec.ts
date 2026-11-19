import { PopoverAlign, popoverAlignment } from './popover-alignment';

const VIEWPORT_WIDTH = 1024;
const PANEL_WIDTH = 320;

describe('popoverAlignment', () => {
  it('aligns to the start when the panel fits', () => {
    expect(popoverAlignment(100, VIEWPORT_WIDTH, PANEL_WIDTH)).toBe(PopoverAlign.Start);
  });

  it('aligns to the end when it would cross the right edge', () => {
    expect(popoverAlignment(800, VIEWPORT_WIDTH, PANEL_WIDTH)).toBe(PopoverAlign.End);
  });
});
