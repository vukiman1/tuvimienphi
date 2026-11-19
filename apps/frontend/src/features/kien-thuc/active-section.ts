export const SECTION_PROBE_REM = 6;

const SECTION_ID_PREFIX = 'muc-';
const FIRST_SECTION_INDEX = 0;

export function sectionId(index: number): string {
  return `${SECTION_ID_PREFIX}${index + 1}`;
}

export function activeSectionIndex(sectionTops: readonly number[], probeLine: number): number {
  return sectionTops.reduce(
    (active, top, index) => (top <= probeLine ? index : active),
    FIRST_SECTION_INDEX,
  );
}
