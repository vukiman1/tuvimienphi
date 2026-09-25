import type { CSSProperties } from 'react';

const BLOB_TINT = '#dde5fb';
const DOT_TINT = '#d3ddf8';
const DOT_SPACING = 22;
const DOT_RADIUS = 1.6;

const dotField: CSSProperties = {
  position: 'absolute',
  backgroundImage: `radial-gradient(circle, ${DOT_TINT} ${DOT_RADIUS}px, transparent ${DOT_RADIUS}px)`,
  backgroundSize: `${DOT_SPACING}px ${DOT_SPACING}px`,
};

const blob: CSSProperties = {
  position: 'absolute',
  borderRadius: '50%',
  background: BLOB_TINT,
  opacity: 0.55,
};

export function LoginBackdrop() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #f8faff 0%, #eef2fd 100%)',
      }}
    >
      <div style={{ ...blob, top: -260, left: -220, width: 560, height: 560 }} />
      <div style={{ ...blob, bottom: -300, right: -180, width: 620, height: 620, opacity: 0.45 }} />
      <div style={{ ...dotField, top: 48, right: 88, width: 150, height: 110 }} />
      <div style={{ ...dotField, bottom: 120, left: 24, width: 150, height: 110 }} />
    </div>
  );
}
