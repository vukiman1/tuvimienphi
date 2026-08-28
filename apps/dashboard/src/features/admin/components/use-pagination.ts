import { useMemo, useState } from 'react';

export interface Pagination<T> {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  pageItems: T[];
  setPage: (page: number) => void;
  rangeStart: number;
  rangeEnd: number;
}

/** Client-side pagination over an in-memory list. Resets to page 1 whenever the list length changes
 *  (e.g. a filter narrows results) using the render-time reset pattern, so you never land on an empty
 *  out-of-range page and no effect is needed. */
export function usePagination<T>(items: T[], pageSize = 8): Pagination<T> {
  const [page, setPage] = useState(1);
  const totalItems = items.length;

  // Adjust state during render when the source length changes (React's sanctioned reset pattern).
  const [prevTotal, setPrevTotal] = useState(totalItems);
  if (prevTotal !== totalItems) {
    setPrevTotal(totalItems);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const current = Math.min(page, totalPages);
  const pageItems = useMemo(
    () => items.slice((current - 1) * pageSize, current * pageSize),
    [items, current, pageSize],
  );

  return {
    page: current,
    pageSize,
    totalItems,
    totalPages,
    pageItems,
    setPage,
    rangeStart: totalItems === 0 ? 0 : (current - 1) * pageSize + 1,
    rangeEnd: Math.min(current * pageSize, totalItems),
  };
}
