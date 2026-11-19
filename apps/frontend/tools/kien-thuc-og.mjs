import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const FRONTEND_ROOT = fileURLToPath(new URL('..', import.meta.url));
const PUBLIC_DIRECTORY = join(FRONTEND_ROOT, 'public');
const FONT_DIRECTORY = join(FRONTEND_ROOT, 'node_modules/@fontsource');
const OUTPUT_DIRECTORY = join(PUBLIC_DIRECTORY, 'og/kien-thuc');
const LOGO_MARK_FILE = pathToFileURL(join(PUBLIC_DIRECTORY, 'brand/logo-mark-128.webp')).href;
const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;
const JPEG_QUALITY = 70;
const ORBIT_RINGS = [
  { radius: 150, opacity: 0.55 },
  { radius: 235, opacity: 0.35 },
  { radius: 320, opacity: 0.2 },
];
const ORBIT_STARS = [
  { ring: 0, angle: 200 },
  { ring: 1, angle: 305 },
  { ring: 1, angle: 95 },
  { ring: 2, angle: 125 },
  { ring: 2, angle: 20 },
];

const FONT_FACES = [
  ['Inter Tight', 800, 'normal', 'inter-tight/files/inter-tight-latin-800-normal.woff2'],
  ['Inter Tight', 800, 'normal', 'inter-tight/files/inter-tight-vietnamese-800-normal.woff2'],
  ['Inter Tight', 600, 'normal', 'inter-tight/files/inter-tight-latin-600-normal.woff2'],
  ['Inter Tight', 600, 'normal', 'inter-tight/files/inter-tight-vietnamese-600-normal.woff2'],
  [
    'Playfair Display',
    600,
    'italic',
    'playfair-display/files/playfair-display-latin-600-italic.woff2',
  ],
  [
    'Playfair Display',
    600,
    'italic',
    'playfair-display/files/playfair-display-vietnamese-600-italic.woff2',
  ],
];

const CARDS = [
  {
    slug: 'hub',
    lead: 'Học tử vi',
    emphasis: 'từ đầu',
    trail: '',
    detail: 'Lộ trình 6 bước, tra cứu sao, cung',
  },
  {
    slug: 'bai',
    lead: 'Lộ trình',
    emphasis: 'học tử vi',
    trail: '',
    detail: 'Sáu bước, mỗi bước vài bài ngắn',
  },
  {
    slug: 'sao',
    lead: 'Các',
    emphasis: 'sao',
    trail: 'trong tử vi',
    detail: 'Chính tinh, tứ hóa, phụ tinh',
  },
  {
    slug: 'cung',
    lead: 'Mười hai',
    emphasis: 'cung',
    trail: '',
    detail: 'Cung đối, tam hợp, ý nghĩa',
  },
  {
    slug: 'thuat-ngu',
    lead: 'Thuật ngữ',
    emphasis: 'tử vi',
    trail: '',
    detail: 'Ngũ hành và từ thường gặp',
  },
];

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function fontFaceCss() {
  return FONT_FACES.map(
    ([family, weight, style, file]) =>
      `@font-face { font-family: '${family}'; font-weight: ${weight}; font-style: ${style}; src: url('${pathToFileURL(join(FONT_DIRECTORY, file)).href}') format('woff2'); }`,
  ).join('\n');
}

function orbitSvg() {
  const centerX = 930;
  const centerY = 315;
  const rings = ORBIT_RINGS.map(
    ({ radius, opacity }) =>
      `<circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="none" stroke="#f2c879" stroke-opacity="${opacity}" stroke-width="2"/>`,
  ).join('');
  const stars = ORBIT_STARS.map(({ ring, angle }) => {
    const radians = (angle * Math.PI) / 180;
    const x = centerX + ORBIT_RINGS[ring].radius * Math.cos(radians);
    const y = centerY + ORBIT_RINGS[ring].radius * Math.sin(radians);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9" fill="#f2c879"/>`;
  }).join('');
  const core = `<circle cx="${centerX}" cy="${centerY}" r="26" fill="#f2c879"/>`;
  return `<svg class="orbit" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" aria-hidden="true">${rings}${stars}${core}</svg>`;
}

function cardDocument(card) {
  const trail = card.trail === '' ? '' : ` ${escapeHtml(card.trail)}`;
  return `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><style>
${fontFaceCss()}
* { margin: 0; box-sizing: border-box; }
body { position: relative; width: ${CARD_WIDTH}px; height: ${CARD_HEIGHT}px; overflow: hidden; background: #0e1222; color: #f7f2e7; font-family: 'Inter Tight', sans-serif; }
.orbit { position: absolute; inset: 0; }
.content { position: absolute; inset: 64px 72px; display: flex; flex-direction: column; justify-content: space-between; width: 640px; }
.brand { display: flex; align-items: center; gap: 14px; font-weight: 800; font-size: 30px; letter-spacing: -0.02em; }
.brand img { width: 48px; height: 48px; }
h1 { font-weight: 800; font-size: 76px; line-height: 1.15; letter-spacing: -0.03em; word-spacing: 0.12em; text-wrap: balance; }
em { font-family: 'Playfair Display', serif; font-weight: 600; font-style: italic; color: #f2c879; letter-spacing: 0; }
.detail { margin-top: 22px; color: #c9c2b4; font-weight: 600; font-size: 28px; }
</style></head><body>
${orbitSvg()}
<div class="content">
  <div class="brand"><img src="${LOGO_MARK_FILE}" alt="">Tử Vi Miễn Phí</div>
  <div>
    <h1>${escapeHtml(card.lead)} <em>${escapeHtml(card.emphasis)}</em>${trail}</h1>
    <p class="detail">${escapeHtml(card.detail)}</p>
  </div>
</div>
</body></html>`;
}

async function renderCards(cards) {
  await mkdir(OUTPUT_DIRECTORY, { recursive: true });
  const scratchDirectory = await mkdtemp(join(tmpdir(), 'kien-thuc-og-'));
  const documentFile = join(scratchDirectory, 'card.html');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: CARD_WIDTH, height: CARD_HEIGHT } });
  try {
    for (const card of cards) {
      await writeFile(documentFile, cardDocument(card));
      await page.goto(pathToFileURL(documentFile).href, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({
        path: join(OUTPUT_DIRECTORY, `${card.slug}.jpg`),
        type: 'jpeg',
        quality: JPEG_QUALITY,
      });
    }
  } finally {
    await browser.close();
    await rm(scratchDirectory, { recursive: true, force: true });
  }
}

await renderCards(CARDS);
console.log(`[kien-thuc-og] wrote ${CARDS.length} cards to ${OUTPUT_DIRECTORY}`);
