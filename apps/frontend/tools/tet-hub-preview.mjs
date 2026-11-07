import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tuoiNamFacts } from '@org/shared-tu-vi';

const FRONTEND_ROOT = fileURLToPath(new URL('..', import.meta.url));
const DEFAULT_CONTENT_DIRECTORY = 'src/features/tet-hub/content/2027';
const OUTPUT_FILE = join(FRONTEND_ROOT, 'tmp/tet-hub-preview.html');
const YEAR_PAGE_FILE = /^tuoi-[a-z]+-[a-z]+-\d{4}\.json$/;
const EMPTY_FACT = 'không';
const ARTICLE_SECTIONS = [
  ['tongQuan', 'Tổng quan'],
  ['saoHanNam', 'Sao hạn nam mạng'],
  ['saoHanNu', 'Sao hạn nữ mạng'],
  ['menh', 'Mệnh'],
  ['cuoiNha', 'Cưới hỏi, làm nhà'],
  ['loiKhuyen', 'Lời khuyên'],
];
const PAGE_STYLE = `
  body { font: 16px/1.6 Georgia, serif; max-width: 760px; margin: 2rem auto; padding: 0 1rem; color: #2a1f0e; }
  section { border-top: 2px solid #c9a15c; margin-top: 2.5rem; padding-top: 1rem; }
  dl { display: grid; grid-template-columns: max-content 1fr; gap: 0.25rem 1rem; background: #faf5ea; padding: 0.75rem 1rem; }
  dt { font-weight: bold; }
  dd { margin: 0; }
`;

class TetHubPreviewError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TetHubPreviewError';
  }
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatFacts(facts) {
  return [
    ['Tuổi', facts.canChi],
    ['Tuổi mụ', facts.tuoi],
    ['Giai đoạn', facts.giaiDoan],
    ['Mệnh', facts.menh.name],
    ['Mệnh năm xem', facts.menhNam.name],
    ['Mệnh với năm', facts.menhVoiNam],
    ['Sao nam mạng', facts.nam.sao],
    ['Hạn nam mạng', facts.nam.han],
    ['Sao nữ mạng', facts.nu.sao],
    ['Hạn nữ mạng', facts.nu.han],
    ['Tam tai', facts.tamTai ?? EMPTY_FACT],
    ['Thái Tuế', facts.thaiTue.length > 0 ? facts.thaiTue.join(', ') : EMPTY_FACT],
    ['Kim Lâu', facts.kimLau ?? EMPTY_FACT],
    ['Hoang Ốc', facts.hoangOc],
  ];
}

function renderFacts(article) {
  const rows = formatFacts(tuoiNamFacts(article.birthYear, article.viewYear))
    .map(([label, value]) => `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`)
    .join('');
  return `<dl>${rows}</dl>`;
}

function renderParagraphs(paragraphs) {
  return paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('');
}

function renderSection(article, [key, title]) {
  const paragraphs = article[key] ?? [];
  return `<h3>${escapeHtml(title)}</h3>${renderParagraphs(paragraphs)}`;
}

function renderFaq(faq) {
  const items = faq
    .map(({ question, answer }) => `<h4>${escapeHtml(question)}</h4><p>${escapeHtml(answer)}</p>`)
    .join('');
  return `<h3>Câu hỏi thường gặp</h3>${items}`;
}

function renderPage(article) {
  const sections = ARTICLE_SECTIONS.map((section) => renderSection(article, section)).join('');
  return `<section><h2>${escapeHtml(article.slug)}</h2>${renderFacts(article)}${sections}${renderFaq(article.faq ?? [])}</section>`;
}

function renderDocument(articles) {
  const pages = articles.map(renderPage).join('');
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Tet hub preview</title><style>${PAGE_STYLE}</style></head><body><h1>Tử vi 2027 theo tuổi: ${articles.length} trang</h1>${pages}</body></html>`;
}

async function readYearPages(contentDirectory) {
  const entries = await readdir(contentDirectory).catch(() => []);
  const fileNames = entries.filter((name) => YEAR_PAGE_FILE.test(name)).sort();
  if (fileNames.length === 0) {
    throw new TetHubPreviewError(`No year pages found in ${contentDirectory}`);
  }
  return Promise.all(
    fileNames.map(async (name) => JSON.parse(await readFile(join(contentDirectory, name), 'utf8'))),
  );
}

async function main() {
  const contentDirectory = resolve(FRONTEND_ROOT, process.argv[2] ?? DEFAULT_CONTENT_DIRECTORY);
  const articles = await readYearPages(contentDirectory);
  await mkdir(dirname(OUTPUT_FILE), { recursive: true });
  await writeFile(OUTPUT_FILE, renderDocument(articles), 'utf8');
  console.log(`Wrote ${articles.length} year pages to ${OUTPUT_FILE}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
