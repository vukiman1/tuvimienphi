import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import type { BreadcrumbItem } from '../tuoi-nam-breadcrumb';

interface TetHubBreadcrumbProps {
  readonly items: readonly BreadcrumbItem[];
}

export function TetHubBreadcrumb({ items }: TetHubBreadcrumbProps): ReactElement {
  const current = items[items.length - 1];
  const ancestors = items.slice(0, -1);

  return (
    <nav aria-label="Đường dẫn">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-[#8d7a5c]">
        {ancestors.map(({ name, path }) => (
          <li key={path} className="flex items-center gap-2">
            <Link to={path} className="no-underline transition-colors hover:text-[#9e2b1e]">
              {name}
            </Link>
            <span aria-hidden>›</span>
          </li>
        ))}
        <li aria-current="page" className="font-medium text-[#2a1f0e]">
          {current.name}
        </li>
      </ol>
    </nav>
  );
}
