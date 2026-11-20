import type { ReactElement } from 'react';
import type { KienThucManifest } from '@org/shared-contracts';
import { ProgressCardSlot } from '../components/progress-card-slot';

interface HubProgressSlotProps {
  readonly manifest: KienThucManifest;
}

export function HubProgressSlot({ manifest }: HubProgressSlotProps): ReactElement {
  return <ProgressCardSlot manifest={manifest} lessonSlug={null} />;
}
