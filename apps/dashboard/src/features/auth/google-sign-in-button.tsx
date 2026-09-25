import { useEffect, useRef, useState } from 'react';
import { ArrowRightOutlined } from '@ant-design/icons';
import { Alert, Flex, Typography, theme } from 'antd';
import { GoogleIcon } from '@/components/icons/google-icon';
import { env } from '@/config/env';
import { errorMessage } from '@/lib/api-error';
import { loadGoogleIdentity } from '@/lib/google-identity';

const MAX_BUTTON_WIDTH = 400;
const GOOGLE_BUTTON_HEIGHT = 40;
const BUTTON_HEIGHT = 56;
const HOVER_SCALE = 1.01;
const HOVER_TRANSITION =
  'transform 180ms ease-out, box-shadow 180ms ease-out, border-color 180ms ease-out';
const RESTING_SHADOW = '0 1px 2px rgba(15, 23, 42, 0.04)';
const HOVER_SHADOW = '0 4px 14px rgba(79, 125, 243, 0.10)';
const RESTING_BORDER = '#e6ebf5';
const ARROW_COLOR = '#94a3b8';
const GIS_UNAVAILABLE = 'Không khởi tạo được đăng nhập Google.';
const MISSING_CLIENT_ID = 'Thiếu VITE_GOOGLE_CLIENT_ID trong apps/dashboard/.env.local.';

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

interface GoogleSignInButtonProps {
  onCredential: (credential: string) => void;
  onUnavailable: (message: string) => void;
}

interface OverlaySize {
  width: number;
  height: number;
}

export function GoogleSignInButton({ onCredential, onUnavailable }: GoogleSignInButtonProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [overlaySize, setOverlaySize] = useState<OverlaySize | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isStill] = useState(prefersReducedMotion);
  const { token } = theme.useToken();
  const clientId = env.googleClientId;
  const renderWidth = overlaySize ? Math.min(Math.round(overlaySize.width), MAX_BUTTON_WIDTH) : 0;

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
  }, [clientId]);

  useEffect(() => {
    let frame = 0;

    const syncFocus = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const wrapper = wrapperRef.current;
        setIsFocused(Boolean(wrapper?.contains(document.activeElement)));
      });
    };

    document.addEventListener('focusin', syncFocus);
    document.addEventListener('focusout', syncFocus);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('focusin', syncFocus);
      document.removeEventListener('focusout', syncFocus);
    };
  }, []);

  useEffect(() => {
    const googleButton = googleButtonRef.current;
    if (!clientId || !googleButton || renderWidth === 0) {
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
        identity.renderButton(googleButton, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          width: renderWidth,
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
  }, [clientId, onCredential, onUnavailable, renderWidth]);

  if (!clientId) {
    return <Alert type="error" showIcon title={MISSING_CLIENT_ID} />;
  }

  const isLifted = isHovered && !isStill;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        transform: `scale(${isLifted ? HOVER_SCALE : 1})`,
        transition: isStill ? undefined : HOVER_TRANSITION,
      }}
      ref={wrapperRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Flex
        aria-hidden="true"
        align="center"
        gap={12}
        style={{
          minHeight: BUTTON_HEIGHT,
          paddingInline: 18,
          borderRadius: 14,
          border: `1px solid ${isFocused || isLifted ? token.colorPrimaryBorder : RESTING_BORDER}`,
          background: token.colorBgContainer,
          boxShadow: isFocused
            ? `0 0 0 3px ${token.controlOutline}`
            : isLifted
              ? HOVER_SHADOW
              : RESTING_SHADOW,
          transition: isStill ? undefined : HOVER_TRANSITION,
        }}
      >
        <GoogleIcon />
        <Typography.Text strong style={{ flex: 1, textAlign: 'center' }}>
          Đăng nhập bằng Google
        </Typography.Text>
        <ArrowRightOutlined style={{ color: ARROW_COLOR }} />
      </Flex>

      <div
        ref={overlayRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          overflow: 'hidden',
          opacity: 0,
          cursor: 'pointer',
        }}
      >
        <div
          ref={googleButtonRef}
          style={
            overlaySize && renderWidth > 0
              ? {
                  transformOrigin: 'top left',
                  transform: `scale(${overlaySize.width / renderWidth}, ${overlaySize.height / GOOGLE_BUTTON_HEIGHT})`,
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
