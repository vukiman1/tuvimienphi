export enum PopoverAlign {
  Start = 'start',
  End = 'end',
}

export const TERM_PANEL_WIDTH_REM = 20;

export function popoverAlignment(
  termLeft: number,
  viewportWidth: number,
  panelWidth: number,
): PopoverAlign {
  return termLeft + panelWidth > viewportWidth ? PopoverAlign.End : PopoverAlign.Start;
}
