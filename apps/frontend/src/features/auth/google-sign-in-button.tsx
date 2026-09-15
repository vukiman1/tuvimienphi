import { useEffect, useRef, useState } from 'react';
import { GoogleIcon } from '@/components/icons/google-icon';
import { appConfig } from '@/config/app-config';
import { ensureGoogleIdentity } from '@/lib/google-identity';
import { AuthOptionButton } from './auth-option-button';

/** Google clamps the rendered button to this width. */
const MAX_BUTTON_WIDTH = 400;
const LARGE_BUTTON_HEIGHT = 40;

interface OverlaySize {
  width: number;
  height: number;
}

/**
 * Our own button, with Google's real one laid transparently over it.
 *
 * Only Google's button produces the ID token the backend verifies, so it has to be the thing that
 * actually gets clicked — but its own styling cannot be made to match the buttons beside it, and
 * it centres its label inside whatever width it is given. Rendering it invisibly on top keeps the
 * credential flow intact while the visible button follows the design system, which is also what
 * lets further providers line up with it later.
 */
export function GoogleSignInButton() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [overlaySize, setOverlaySize] = useState<OverlaySize | null>(null);
  const clientId = appConfig.google.clientId;
  const renderWidth = overlaySize ? Math.min(Math.round(overlaySize.width), MAX_BUTTON_WIDTH) : 0;

  // renderButton takes a number, never a percentage, so the overlay has to be measured to cover
  // the visible button exactly. Anything narrower would leave a dead strip that swallows clicks.
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      setOverlaySize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(overlay);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const googleButton = googleButtonRef.current;
    if (!clientId || !googleButton || renderWidth === 0) {
      return;
    }
    let cancelled = false;

    // The credential callback is registered once by <GoogleOneTap />; this only draws the button.
    void ensureGoogleIdentity({ clientId, callback: () => undefined }).then((identity) => {
      if (!cancelled) {
        identity.renderButton(googleButton, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          width: renderWidth,
          locale: 'en',
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [clientId, renderWidth]);

  if (!clientId) {
    return null;
  }

  return (
    <div className="group relative">
      <AuthOptionButton
        className="group-hover:border-[#c9a15c]/70 group-hover:bg-white/90 group-has-focus-visible:border-ring group-has-focus-visible:ring-[3px] group-has-focus-visible:ring-ring/50"
        icon={<GoogleIcon className="size-6" />}
        label="Tiếp tục với Google"
        tabIndex={-1}
      />

      {/* Transparent, but on top: this is what receives the click. */}
      <div className="absolute inset-0 cursor-pointer overflow-hidden opacity-0" ref={overlayRef}>
        <div
          className="origin-top-left"
          ref={googleButtonRef}
          style={
            overlaySize && renderWidth > 0
              ? { transform: coverScale(overlaySize, renderWidth) }
              : undefined
          }
        />
      </div>
    </div>
  );
}

function coverScale(overlaySize: OverlaySize, renderWidth: number): string {
  return `scale(${overlaySize.width / renderWidth}, ${overlaySize.height / LARGE_BUTTON_HEIGHT})`;
}
