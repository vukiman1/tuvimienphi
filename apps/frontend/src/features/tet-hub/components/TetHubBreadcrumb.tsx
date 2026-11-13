import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { FOCUS_RING_CLASS } from '@/design-system';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '../breadcrumb-item';

interface TetHubBreadcrumbProps {
  readonly items: readonly BreadcrumbItem[];
}

export function TetHubBreadcrumb({ items }: TetHubBreadcrumbProps): ReactElement {
  const current = items[items.length - 1];
  const ancestors = items.slice(0, -1);

  return (
    <nav aria-label="Đường dẫn">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-day-soft">
        {ancestors.map(({ name, path }) => (
          <li key={path} className="flex items-center gap-2">
            <Link
              to={path}
              className={cn('no-underline transition-colors hover:text-dawn', FOCUS_RING_CLASS)}
            >
              {name}
            </Link>
            <span aria-hidden>›</span>
          </li>
        ))}
        <li aria-current="page" className="font-semibold text-day">
          {current.name}
        </li>
      </ol>
    </nav>
  );
}
