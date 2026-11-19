import type { KienThucManifest } from '@org/shared-contracts';
import type { KienThucContentSource } from '../content-source';

export function loadHubPage(source: KienThucContentSource): KienThucManifest {
  return source.loadManifest();
}
