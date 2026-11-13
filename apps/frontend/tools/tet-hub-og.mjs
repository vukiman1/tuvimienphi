import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import {
  CHI,
  TET_HUB_VIEW_YEAR,
  conGiapSlug,
  getYearCanChi,
  tuoiNamFacts,
} from '@org/shared-tu-vi';

const FRONTEND_ROOT = fileURLToPath(new URL('..', import.meta.url));
const PUBLIC_DIRECTORY = join(FRONTEND_ROOT, 'public');
const FONT_DIRECTORY = join(FRONTEND_ROOT, 'node_modules/@fontsource');
const MANIFEST_FILE = join(
  FRONTEND_ROOT,
  `src/features/tet-hub/content/${TET_HUB_VIEW_YEAR}/manifest.json`,
);
const OUTPUT_DIRECTORY = join(PUBLIC_DIRECTORY, 'tet/og');
const HUB_SLUG = `tu-vi-${TET_HUB_VIEW_YEAR}`;
const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;
const JPEG_QUALITY = 70;
const BIRTH_YEAR_IN_SLUG = /-(\d{4})$/;
const EYEBROW = `Tết ${TET_HUB_VIEW_YEAR} · năm ${getYearCanChi(TET_HUB_VIEW_YEAR)}`;

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

class TetHubOgError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TetHubOgError';
  }
}

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function publicFileUrl(path) {
  return pathToFileURL(join(PUBLIC_DIRECTORY, path)).href;
}

function conGiapPaintingFile(chi) {
  return publicFileUrl(`tet/con-giap/${conGiapSlug(chi)}-1536.webp`);
}

function chiOfSlug(slug) {
  const chi = CHI.findIndex((_, index) => conGiapSlug(index) === slug);
  if (chi < 0) throw new TetHubOgError(`No con giáp matches the manifest slug "${slug}"`);
  return chi;
}

function birthYearOfSlug(slug) {
  const match = BIRTH_YEAR_IN_SLUG.exec(slug);
  if (match === null) throw new TetHubOgError(`No birth year at the end of the slug "${slug}"`);
  return Number(match[1]);
}

function hubCard() {
  return {
    slug: HUB_SLUG,
    painting: publicFileUrl('tet/hero-night-1536.webp'),
    lead: 'Tử vi',
    emphasis: String(TET_HUB_VIEW_YEAR),
    trail: 'theo tuổi',
    detail: 'Sao chiếu mệnh, hạn, Tam tai cho 12 con giáp',
  };
}

function conGiapCard(slug) {
  const chi = chiOfSlug(slug);
  return {
    slug,
    painting: conGiapPaintingFile(chi),
    lead: 'Tử vi tuổi',
    emphasis: CHI[chi],
    trail: `năm ${TET_HUB_VIEW_YEAR}`,
    detail: 'Tam tai, Thái tuế, tuổi hợp xông đất',
  };
}

function tuoiNamCard(slug) {
  const facts = tuoiNamFacts(birthYearOfSlug(slug), TET_HUB_VIEW_YEAR);
  return {
    slug,
    painting: conGiapPaintingFile(facts.chi),
    lead: 'Tử vi tuổi',
    emphasis: `${facts.canChi} ${facts.birthYear}`,
    trail: `năm ${facts.viewYear}`,
    detail: `Nam: sao ${facts.nam.sao} · Nữ: sao ${facts.nu.sao}`,
  };
}

function fontFaceCss() {
  return FONT_FACES.map(
    ([family, weight, style, file]) =>
      `@font-face { font-family: '${family}'; font-weight: ${weight}; font-style: ${style}; src: url('${pathToFileURL(join(FONT_DIRECTORY, file)).href}') format('woff2'); }`,
  ).join('\n');
}

function cardDocument(card) {
  return `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><style>
${fontFaceCss()}
* { margin: 0; box-sizing: border-box; }
body { width: ${CARD_WIDTH}px; height: ${CARD_HEIGHT}px; overflow: hidden; background: #0e1222; color: #f7f2e7; font-family: 'Inter Tight', sans-serif; }
.painting { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 75% 12%; }
.wash { position: absolute; inset: 0; background: linear-gradient(90deg, rgb(14 18 34 / 0.94) 0%, rgb(14 18 34 / 0.7) 45%, rgb(14 18 34 / 0) 75%); }
.content { position: absolute; inset: 64px 72px; display: flex; flex-direction: column; justify-content: space-between; width: 640px; }
.brand { display: flex; align-items: center; gap: 14px; font-weight: 800; font-size: 30px; letter-spacing: -0.02em; }
.brand img { width: 48px; height: 48px; }
.eyebrow { color: #f2c879; font-weight: 600; font-size: 20px; letter-spacing: 0.17em; text-transform: uppercase; }
h1 { margin-top: 18px; font-weight: 800; font-size: 68px; line-height: 1.17; letter-spacing: -0.03em; word-spacing: 0.12em; text-wrap: balance; }
em { font-family: 'Playfair Display', serif; font-weight: 600; font-style: italic; color: #f2c879; letter-spacing: 0; }
.detail { margin-top: 22px; color: #c9c2b4; font-weight: 600; font-size: 26px; }
</style></head><body>
<img class="painting" src="${card.painting}" alt="">
<div class="wash"></div>
<div class="content">
  <div class="brand"><img src="${publicFileUrl('brand/logo-mark-128.webp')}" alt="">Tử Vi Miễn Phí</div>
  <div>
    <p class="eyebrow">${escapeHtml(EYEBROW)}</p>
    <h1>${escapeHtml(card.lead)} <em>${escapeHtml(card.emphasis)}</em> ${escapeHtml(card.trail)}</h1>
    <p class="detail">${escapeHtml(card.detail)}</p>
  </div>
</div>
</body></html>`;
}

async function readCards() {
  const manifest = JSON.parse(await readFile(MANIFEST_FILE, 'utf8'));
  return [hubCard(), ...manifest.conGiap.map(conGiapCard), ...manifest.tuoiNam.map(tuoiNamCard)];
}

async function renderCards(cards) {
  await mkdir(OUTPUT_DIRECTORY, { recursive: true });
  const scratchDirectory = await mkdtemp(join(tmpdir(), 'tet-hub-og-'));
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

const cards = await readCards();
await renderCards(cards);
console.log(`[tet-hub-og] wrote ${cards.length} cards to ${OUTPUT_DIRECTORY}`);
