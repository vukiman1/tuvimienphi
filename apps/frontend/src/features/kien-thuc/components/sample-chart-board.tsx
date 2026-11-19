import { useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { LaSoBoard } from '@/features/la-so/components/la-so-board';
import { sampleChartCaption, sampleChartView } from '../sample-chart-view';
import { SAMPLE_BOARD_MIN_HEIGHT_CLASS } from './sample-chart-board.constants';

export function SampleChartBoard(): ReactElement {
  const chart = useMemo(() => sampleChartView(), []);
  const [selectedIndex, setSelectedIndex] = useState<number>(() =>
    chart.cungs.findIndex((cung) => cung.isMenh),
  );

  return (
    <figure className={SAMPLE_BOARD_MIN_HEIGHT_CLASS}>
      <LaSoBoard chart={chart} selectedIndex={selectedIndex} onSelect={setSelectedIndex} />
      <figcaption className="mt-3 text-sm text-day-soft">{sampleChartCaption()}</figcaption>
    </figure>
  );
}
