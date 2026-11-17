import { ContentKind } from '@org/shared-contracts';
import { CHI } from '@org/shared-tu-vi';
import {
  cungRelations,
  plannedPage,
  ratingAt,
  saoFacts,
  SaoKind,
  type PlannedPage,
} from '@org/shared-kien-thuc';
import { buildPageBrief } from '../brief/build-page-brief';
import { scanLinks, toPlainText } from '../text/link-markup';
import { countSyllables, readingMinutes } from '../text/syllable-count';
import { closestNeighbour, type CorpusPage } from '../validate/check-similarity';
import { ClaimStatus } from '../validate/facts/fact-subject';
import type { ContentFiles } from '../store/content-store';
import type { StoredDraft } from '../store/draft-store';
import { bodyPlainText, validatePage } from '../validate/validate-page';

const EMPTY_CELL = '—';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function publishedRefs(content: ContentFiles): ReadonlySet<string> {
  return new Set<string>([
    ...content.lessons.map((lesson) => `${ContentKind.Bai}/${lesson.slug}`),
    ...content.entries.map((entry) => `${entry.kind}/${entry.slug}`),
  ]);
}

function factsTable(page: PlannedPage): string {
  if (page.kind === ContentKind.Sao) {
    const facts = saoFacts(page.star);
    const header = facts.kind === SaoKind.ChinhTinh ? `chòm ${facts.chom}` : facts.hanh;
    const cells = CHI.map(
      (chi, index) => `<td>${chi}: ${ratingAt(page.star, index) ?? EMPTY_CELL}</td>`,
    );
    return `<table><caption>${escapeHtml(`${page.star} — ${header}`)}</caption><tr>${cells.join('')}</tr></table>`;
  }
  if (page.kind === ContentKind.Cung) {
    const relations = cungRelations(page.cung);
    return `<p>Đối cung ${escapeHtml(relations.doiCung)}; tam hợp ${escapeHtml(relations.tamHop.join(', '))}.</p>`;
  }
  return '';
}

function renderParagraph(paragraph: string, published: ReadonlySet<string>): string {
  const scan = scanLinks(paragraph);
  const links = scan.links
    .map((link) => {
      const mark = published.has(link.ref) ? '' : ' (chưa có)';
      return `<li>${escapeHtml(link.label)} → ${escapeHtml(link.ref)}${mark}</li>`;
    })
    .join('');
  return `<p>${escapeHtml(toPlainText(paragraph))}</p>${links === '' ? '' : `<ul>${links}</ul>`}`;
}

function changedHeadings(draft: StoredDraft, content: ContentFiles): readonly string[] {
  const entry = content.entries.find((item) => `${item.kind}/${item.slug}` === draft.ref);
  const lesson = content.lessons.find((item) => `${ContentKind.Bai}/${item.slug}` === draft.ref);
  const current = entry ?? lesson;
  if (current === undefined) return [];
  return draft.draft.sections
    .filter((section, index) => JSON.stringify(section) !== JSON.stringify(current.sections[index]))
    .map((section) => section.heading);
}

export function renderPreview(
  drafts: readonly StoredDraft[],
  content: ContentFiles,
  corpus: readonly CorpusPage[],
): string {
  const published = publishedRefs(content);
  const cards = drafts.map((stored) => {
    const page = plannedPage(stored.ref);
    if (page === undefined)
      return `<section><h2>${escapeHtml(stored.ref)}</h2><p>không có trong danh mục</p></section>`;
    const plainText = bodyPlainText(stored.draft);
    const validation = validatePage(stored.draft, {
      page,
      requiredMentions: buildPageBrief(page).requiredMentions,
      corpus: corpus.filter((item) => item.ref !== stored.ref),
    });
    const syllables = countSyllables(
      stored.draft.sections.flatMap((s) => [s.heading, ...s.paragraphs]).join(' '),
    );
    const neighbour = closestNeighbour(
      stored.ref,
      plainText,
      corpus.filter((item) => item.ref !== stored.ref),
    );
    const claims = validation.claims
      .map((claim) => {
        const status = claim.status === ClaimStatus.Skipped ? 'bỏ qua' : 'đã soát';
        return `<li>[${status}] ${escapeHtml(claim.clause)}</li>`;
      })
      .join('');
    const sections = stored.draft.sections
      .map(
        (section) =>
          `<h3>${escapeHtml(section.heading)}</h3>${section.paragraphs.map((p) => renderParagraph(p, published)).join('')}`,
      )
      .join('');
    const changed = changedHeadings(stored, content);
    return [
      `<section>`,
      `<h2>${escapeHtml(page.title)} — ${escapeHtml(stored.ref)}</h2>`,
      `<p>${escapeHtml(stored.draft.summary)}</p>`,
      `<p>${syllables} âm tiết · ${readingMinutes(syllables)} phút · ${escapeHtml(stored.draft.writtenBy)} ${escapeHtml(stored.draft.writtenAt)}</p>`,
      factsTable(page),
      `<ul class="claims">${claims}</ul>`,
      sections,
      changed.length > 0 ? `<p>Đã đổi: ${escapeHtml(changed.join(', '))}</p>` : '',
      neighbour === null
        ? ''
        : `<p>Gần nhất: ${escapeHtml(neighbour.ref)} (${neighbour.score.toFixed(2)})</p>`,
      ...validation.warnings.map((w) => `<p class="warn">${escapeHtml(w)}</p>`),
      `</section>`,
    ].join('\n');
  });
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Kiến thức preview</title></head><body>${cards.join('\n')}</body></html>`;
}
