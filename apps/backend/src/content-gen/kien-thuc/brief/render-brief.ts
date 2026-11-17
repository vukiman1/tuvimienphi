import { ContentKind } from '@org/shared-contracts';
import { plannedRefOf } from '@org/shared-kien-thuc';
import type { LinkTarget, PageBrief } from './page-brief';
import { writingGuideFor } from './writing-guide';

const DRAFTS_DIRECTORY = 'tmp/kien-thuc/drafts';
const DRAFT_SHAPE = [
  '```json',
  '{',
  '  "summary": "…",',
  '  "sections": [{ "heading": "…", "paragraphs": ["…"] }],',
  '  "writtenBy": "claude-code",',
  '  "writtenAt": "<ISO time>"',
  '}',
  '```',
];

function linkLine(target: LinkTarget): string {
  return `- [[${target.ref}|${target.title}]]`;
}

function bullets(lines: readonly string[]): readonly string[] {
  return lines.map((line) => `- ${line}`);
}

export function renderBrief(brief: PageBrief): string {
  const { page, limits } = brief;
  const ref = plannedRefOf(page);
  const draftPath = `${DRAFTS_DIRECTORY}/${page.kind}/${page.slug}.json`;
  const sections: string[] = [
    `# Brief: ${page.title}`,
    `- Ref: \`${ref}\``,
    `- Loại: ${page.kind}`,
    '',
    '## Hướng dẫn viết',
  ];
  for (const rule of writingGuideFor(page)) {
    sections.push(`### ${rule.heading}`, ...bullets(rule.lines));
  }
  sections.push(
    '',
    '## Độ dài và hình thức',
    `- ${limits.minSyllables}–${limits.maxSyllables} âm tiết`,
    `- ${limits.minSections}–${limits.maxSections} mục, ${limits.minParagraphs}–${limits.maxParagraphs} đoạn mỗi mục`,
    `- ít nhất ${limits.minLinkTargets} đích liên kết khác nhau`,
    '',
    '## Dữ kiện engine',
    ...bullets(brief.factLines),
  );
  if (brief.mustCover.length > 0) {
    sections.push('', '## Phải nói tới', ...bullets(brief.mustCover));
  }
  sections.push('', '## Bắt buộc nhắc tới', ...bullets(brief.requiredMentions));
  if (page.kind === ContentKind.Bai) {
    sections.push('', '## Vị trí trong lộ trình');
    if (brief.previous !== null)
      sections.push(`- Bài trước: [[${brief.previous.ref}|${brief.previous.title}]]`);
    if (brief.next !== null) sections.push(`- Bài sau: [[${brief.next.ref}|${brief.next.title}]]`);
    sections.push('', '## Khái niệm bài khác sở hữu');
    for (const owned of brief.ownedElsewhere) {
      sections.push(`- ${owned.title} — [[${owned.ref}|khái niệm]]`);
    }
  } else if (brief.teachingLesson !== null) {
    sections.push(
      '',
      '## Bài dạy khái niệm này',
      `- Bài dạy: [[${brief.teachingLesson.ref}|${brief.teachingLesson.title}]]`,
    );
  }
  sections.push('', '## Đích liên kết cho phép', ...brief.linkTargets.map(linkLine));
  sections.push('', '## Tệp cần ghi', `\`${draftPath}\``, ...DRAFT_SHAPE);
  sections.push(
    '',
    '## Tự kiểm',
    `- Chạy \`pnpm nx run @org/backend:kien-thuc -- check --only=${ref}\`, sửa mọi vi phạm.`,
    '- Tối đa 5 vòng; đọc lại các mệnh đề bị bỏ qua; không sửa tệp nào khác.',
  );
  return sections.join('\n');
}
