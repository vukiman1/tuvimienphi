import { useEffect, useRef } from 'react';
import { env } from '@/config/env';
import { errorMessage } from '@/lib/api-error';
import { loadGoogleIdentity } from '@/lib/google-identity';

const BUTTON_WIDTH = 320;
const GIS_UNAVAILABLE = 'Không khởi tạo được đăng nhập Google.';
const MISSING_CLIENT_ID = 'Thiếu VITE_GOOGLE_CLIENT_ID trong apps/dashboard/.env.local.';

interface GoogleSignInButtonProps {
  onCredential: (credential: string) => void;
  onUnavailable: (message: string) => void;
}

export function GoogleSignInButton({ onCredential, onUnavailable }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const clientId = env.googleClientId;

  useEffect(() => {
    const container = containerRef.current;
    if (!clientId || !container) {
      return;
    }
    let isCancelled = false;

    loadGoogleIdentity()
      .then((identity) => {
        if (isCancelled) {
          return;
        }
        identity.initialize({
          client_id: clientId,
          callback: (response) => onCredential(response.credential),
          use_fedcm_for_prompt: true,
        });
        identity.renderButton(container, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'pill',
          width: BUTTON_WIDTH,
          locale: 'vi',
        });
      })
      .catch((caught: unknown) => {
        if (!isCancelled) {
          onUnavailable(errorMessage(caught, GIS_UNAVAILABLE));
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [clientId, onCredential, onUnavailable]);

  if (!clientId) {
    return <p className="text-sm text-destructive">{MISSING_CLIENT_ID}</p>;
  }

  return <div className="flex justify-center" ref={containerRef} />;
}
