import { useEffect, useRef } from 'react';
import { birthKey, type BirthInput } from '@org/shared-contracts';
import { useRecordLaSoHistory } from './use-la-so-history';

/**
 * Records the chart currently on screen, once. Changing the year on the picker navigates without
 * changing the chart, and re-recording on every such navigation would be a write per click.
 */
export function useRecordChartView(input: BirthInput | null): void {
  const record = useRecordLaSoHistory();
  const recorded = useRef<string | null>(null);
  const key = input ? birthKey(input) : null;

  useEffect(() => {
    if (!input || key === null || recorded.current === key) {
      return;
    }
    recorded.current = key;
    record(input);
  }, [input, key, record]);
}
