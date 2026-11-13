import type { ReactElement } from 'react';
import { useLaSoHistory } from '../use-la-so-history';
import { HistoryCard } from './history-card';

export function HistoryList(): ReactElement | null {
  const { entries, isLoading, remove } = useLaSoHistory();

  if (isLoading) {
    return null;
  }

  if (entries.length === 0) {
    return (
      <p className="text-center text-sm text-ink-soft">
        Chưa có lá số nào. Lập một lá số ở trang chủ, nó sẽ được lưu lại đây.
      </p>
    );
  }

  return (
    <ul className="grid gap-5 md:grid-cols-2">
      {entries.map((entry) => (
        <HistoryCard entry={entry} key={entry.birthKey} onRemove={remove} />
      ))}
    </ul>
  );
}
