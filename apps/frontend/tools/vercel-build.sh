#!/usr/bin/env bash
set -euo pipefail

readonly CHROMIUM_SYSTEM_LIBRARIES=(
  alsa-lib
  at-spi2-atk
  atk
  cairo
  cups-libs
  dbus-libs
  expat
  glib2
  libX11
  libXcomposite
  libXdamage
  libXext
  libXfixes
  libXrandr
  libdrm
  libxcb
  libxkbcommon
  mesa-libgbm
  nspr
  nss
  pango
)

pnpm nx build @org/frontend
dnf install -y "${CHROMIUM_SYSTEM_LIBRARIES[@]}"
npx playwright install chromium
node tools/prerender.mjs
