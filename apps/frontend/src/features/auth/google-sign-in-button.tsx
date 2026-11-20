import { type ReactElement, useEffect, useRef, useState } from 'react';
import { appConfig } from '@/config/app-config';
import { ensureGoogleIdentity } from '@/lib/google-identity';
import type { GoogleButtonOptions } from '@/types/google-identity';

const GOOGLE_MAX_BUTTON_WIDTH = 400;

const GOOGLE_BUTTON_OPTIONS = {
  type: 'standard',
  theme: 'outline',
  size: 'large',
  text: 'continue_with',
  shape: 'pill',
  logo_alignment: 'left',
  locale: 'vi',
} as const satisfies GoogleButtonOptions;

export function GoogleSignInButton(): ReactElement | null {
  const slotRef = useRef<HTMLDivElement>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [slotWidth, setSlotWidth] = useState(0);
  const [isGoogleButtonLoaded, setIsGoogleButtonLoaded] = useState(false);
  const clientId = appConfig.google.clientId;
  const buttonWidth = Math.min(Math.round(slotWidth), GOOGLE_MAX_BUTTON_WIDTH);

  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => setSlotWidth(entry.contentRect.width));
    observer.observe(slot);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const googleButton = googleButtonRef.current;
    if (!googleButton) {
      return;
    }

    const markLoaded = (): void => setIsGoogleButtonLoaded(true);
    googleButton.addEventListener('load', markLoaded, true);

    return () => googleButton.removeEventListener('load', markLoaded, true);
  }, []);

  useEffect(() => {
    const googleButton = googleButtonRef.current;
    if (!clientId || !googleButton || buttonWidth === 0) {
      return;
    }
    let isCancelled = false;

    void ensureGoogleIdentity({ clientId }).then((identity) => {
      if (!isCancelled) {
        identity.renderButton(googleButton, { ...GOOGLE_BUTTON_OPTIONS, width: buttonWidth });
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [clientId, buttonWidth]);

  if (!clientId) {
    return null;
  }

  return (
    <div className="grid h-10 w-full justify-items-center" ref={slotRef}>
      {!isGoogleButtonLoaded && (
        <div
          aria-hidden="true"
          className="col-start-1 row-start-1 h-10 w-full max-w-100 rounded-full border bg-white motion-safe:animate-pulse"
        />
      )}
      <div className="col-start-1 row-start-1 h-10" ref={googleButtonRef} />
    </div>
  );
}
