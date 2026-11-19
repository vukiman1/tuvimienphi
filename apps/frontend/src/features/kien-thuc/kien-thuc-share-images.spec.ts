import { statSync } from 'node:fs';
import { join } from 'node:path';
import { KienThucPageType, shareImagePath } from './kien-thuc-paths';

const PUBLIC_DIRECTORY = join(__dirname, '../../../public');
const MAX_IMAGE_BYTES = 120 * 1024;

function imageBytes(type: KienThucPageType): number {
  try {
    return statSync(join(PUBLIC_DIRECTORY, shareImagePath(type))).size;
  } catch {
    return 0;
  }
}

describe('kiến thức share images', () => {
  it.each(Object.values(KienThucPageType))('ships a small share image for %s pages', (type) => {
    const bytes = imageBytes(type);

    expect(bytes).toBeGreaterThan(0);
    expect(bytes).toBeLessThan(MAX_IMAGE_BYTES);
  });
});
