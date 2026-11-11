export const REVEAL_TRANSITION_CLASS =
  'transition-[opacity,transform] duration-700 ease-out will-change-transform motion-reduce:!translate-y-0 motion-reduce:!opacity-100 motion-reduce:transition-none';

export function revealStateClass(isRevealed: boolean): string {
  return isRevealed
    ? 'translate-y-0 opacity-100'
    : 'motion-ready:translate-y-6 motion-ready:opacity-0';
}
