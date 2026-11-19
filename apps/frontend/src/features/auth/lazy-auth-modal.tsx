import { type ReactElement, Suspense, useState } from 'react';
import { lazyRouteComponent } from '@tanstack/react-router';
import { useIsClient } from '@/hooks/use-is-client';
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
  const isClient = useIsClient();
  const [hasOpened, setHasOpened] = useState<boolean>(false);
  if (isClient && view !== null && !hasOpened) {
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
