import type { MouseEvent, ReactElement, ReactNode } from 'react';
import { useLocation, useNavigate } from '@tanstack/react-router';

const PRIMARY_BUTTON = 0;

interface SamePageLinkProps {
  readonly hash: string;
  readonly className: string;
  readonly ariaCurrent?: 'location';
  readonly children: ReactNode;
}

function opensElsewhere(event: MouseEvent<HTMLAnchorElement>): boolean {
  return (
    event.button !== PRIMARY_BUTTON ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}

export function SamePageLink({
  hash,
  className,
  ariaCurrent,
  children,
}: SamePageLinkProps): ReactElement {
  const pathname = useLocation({ select: (location) => location.pathname });
  const navigate = useNavigate();

  function handleClick(event: MouseEvent<HTMLAnchorElement>): void {
    if (opensElsewhere(event)) {
      return;
    }
    event.preventDefault();
    void navigate({ to: '.', hash });
  }

  return (
    <a
      href={`${pathname}#${hash}`}
      aria-current={ariaCurrent}
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
}
