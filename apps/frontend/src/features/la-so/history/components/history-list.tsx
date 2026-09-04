import { useLaSoHistory } from '../use-la-so-history';
import { HistoryCard } from './history-card';

/**
 * Nothing here is worth a loading skeleton: signed out the list comes straight from the browser,
 * and signed in it is a short request. A skeleton would flash rather than reassure.
 */
export function HistoryList() {
  const { entries, isLoading, remove } = useLaSoHistory();

  if (isLoading) {
    return null;
  }

  if (entries.length === 0) {
    return (
      <p className="mt-10 text-sm text-muted-foreground">
        Chưa có lá số nào. Lập một lá số ở trang chủ, nó sẽ được lưu lại đây.
      </p>
    );
  }

  return (
    <ul className="mt-8 grid gap-3 sm:grid-cols-2">
      {entries.map((entry) => (
        <HistoryCard entry={entry} key={entry.birthKey} onRemove={remove} />
      ))}
    </ul>
  );
}
