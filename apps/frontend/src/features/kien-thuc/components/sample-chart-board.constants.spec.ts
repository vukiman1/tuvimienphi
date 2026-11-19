import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  SAMPLE_BOARD_PANEL_CLASS,
  SAMPLE_BOARD_PLACEHOLDER_CLASS,
} from './sample-chart-board.constants';

const EAGER_SOURCE_FILES: readonly string[] = [
  join(__dirname, '../pages/lesson-page.tsx'),
  join(__dirname, 'sample-chart-board.constants.ts'),
];
const CHART_ENGINE_IMPORT = /from '[^']*(sample-chart-view|to-chart-view)'/;
const BREAKPOINT_PREFIXES: readonly string[] = ['', 'sm:', 'md:', 'lg:', 'xl:'];

describe('lesson chunk', () => {
  it.each(EAGER_SOURCE_FILES)('keeps the chart engine out of %s', (path) => {
    expect(readFileSync(path, 'utf8')).not.toMatch(CHART_ENGINE_IMPORT);
  });
});

describe('sample board placeholder', () => {
  const tokens = SAMPLE_BOARD_PLACEHOLDER_CLASS.split(' ');

  it.each(BREAKPOINT_PREFIXES)('reserves the board height at breakpoint "%s"', (prefix) => {
    expect(tokens.filter((token) => token.startsWith(`${prefix}min-h-`))).toHaveLength(1);
  });

  it('is the same night panel the board renders on', () => {
    expect(tokens).toEqual(expect.arrayContaining(SAMPLE_BOARD_PANEL_CLASS.split(' ')));
  });
});
