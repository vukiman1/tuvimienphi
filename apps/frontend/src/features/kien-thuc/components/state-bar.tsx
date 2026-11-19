import type { ReactElement } from 'react';

export function StateBar(): ReactElement {
  return (
    <span
      aria-hidden="true"
      className="absolute inset-y-2 left-0 w-1 rounded-full inset-ring-2 inset-ring-gold"
    />
  );
}
