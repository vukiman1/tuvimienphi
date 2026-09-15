import { type CSSProperties, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { MEDIA } from '@/config/media';
import { selectIsAuthenticated, useAuthStore } from '@/stores/auth-store';
import { SignInPanel } from './sign-in-panel';
import { SignUpPanel } from './sign-up-panel';
import { useAuthModal, type AuthModalView } from './use-auth-modal';

const PANEL_BACKGROUND: CSSProperties = {
  backgroundColor: '#fbf5ea',
  backgroundImage: `url(${MEDIA.auth.panelTop}), url(${MEDIA.auth.panelBottom}), url(${MEDIA.auth.panelMiddle})`,
  backgroundPosition: 'top center, bottom center, center',
  backgroundAttachment: 'local',
  backgroundRepeat: 'no-repeat, no-repeat, repeat-y',
  backgroundSize: '100% auto, 100% auto, 100% auto',
};

export function AuthModal() {
  const { view, close } = useAuthModal();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  // Guards used to keep signed-in users off the login page; with a modal that job lands here.
  const isOpen = Boolean(view) && !isAuthenticated;

  const [lastView, setLastView] = useState<AuthModalView>(view ?? 'login');
  if (view && view !== lastView) {
    setLastView(view);
  }

  const isLogin = (view ?? lastView) === 'login';

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          void close();
        }
      }}
    >
      <DialogContent
        aria-describedby="auth-modal-description"
        className="block max-h-[calc(100dvh-1.5rem)] max-w-[calc(100vw-1.5rem)] overflow-y-auto rounded-lg border-0 bg-transparent p-0 shadow-[0_24px_60px_rgba(30,18,8,0.45)] sm:max-w-[720px]"
        closeClassName="right-[4%] top-4 size-9 rounded-full sm:top-5 sm:size-11 border border-[#dccbb5] bg-white/40 text-[#2b1d14] hover:bg-white/80 hover:text-[#2b1d14]"
        style={PANEL_BACKGROUND}
      >
        <div className="grid gap-4 px-[8%] pt-[15%] pb-[4%] sm:px-[16%]">
          {isLogin ? <SignInPanel /> : <SignUpPanel />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
