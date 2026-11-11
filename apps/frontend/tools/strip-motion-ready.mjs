const MOTION_READY_ATTRIBUTE = /(<html\b[^>]*?)\s+data-motion="ready"/;

export function stripMotionReady(html) {
  return html.replace(MOTION_READY_ATTRIBUTE, '$1');
}
