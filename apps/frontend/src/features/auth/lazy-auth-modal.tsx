import { type ReactElement, Suspense, useState } from 'react';
import { lazyRouteComponent } from '@tanstack/react-router';
import { useAuthModal } from './use-auth-modal';

interface AuthModalModule {
  readonly AuthModal: () => ReactElement;
}

function importAuthModal(): Promise<AuthModalModule> {
  return import('./auth-modal');
}

const AuthModal = lazyRouteComponent(importAuthModal, 'AuthModal');

export function preloadAuthModal(): void {
  void AuthModal.preload?.();
}

export function LazyAuthModal(): ReactElement | null {
  const { view } = useAuthModal();
  const [hasOpened, setHasOpened] = useState<boolean>(view !== null);
  if (view !== null && !hasOpened) {
    setHasOpened(true);
  }

  if (!hasOpened) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <AuthModal />
    </Suspense>
  );
}
