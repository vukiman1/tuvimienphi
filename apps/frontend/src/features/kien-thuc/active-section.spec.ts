import { activeSectionIndex } from './active-section';

describe('activeSectionIndex', () => {
  it('picks the last section whose top has passed the probe', () => {
    const tops: readonly number[] = [0, 500, 1200];

    expect(activeSectionIndex(tops, 600)).toBe(1);
    expect(activeSectionIndex(tops, -10)).toBe(0);
    expect(activeSectionIndex(tops, 5000)).toBe(2);
  });
});
