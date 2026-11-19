import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const EAGER_SOURCE_FILES: readonly string[] = [
  join(__dirname, '../pages/lesson-page.tsx'),
  join(__dirname, 'sample-chart-board.constants.ts'),
];
const CHART_ENGINE_IMPORT = /from '[^']*(sample-chart-view|to-chart-view)'/;

describe('lesson chunk', () => {
  it.each(EAGER_SOURCE_FILES)('keeps the chart engine out of %s', (path) => {
    expect(readFileSync(path, 'utf8')).not.toMatch(CHART_ENGINE_IMPORT);
  });
});
