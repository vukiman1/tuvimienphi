import { pageRef, parsePageRef, type ContentSection, type PageRef } from '@org/shared-contracts';

const LINK_SOURCE = '\\[\\[([a-z-]+)\\/([a-z0-9-]+)\\|([^\\]|]{1,40})\\]\\]';
const BRACKET_PAIR_SOURCE = '\\[\\[[^\\]]*?\\]\\]';
const LINK_OPEN = '[[';

function linkPattern(): RegExp {
  return new RegExp(LINK_SOURCE, 'gu');
}

function bracketPairPattern(): RegExp {
  return new RegExp(BRACKET_PAIR_SOURCE, 'gu');
}

export interface ContentLink {
  readonly ref: PageRef;
  readonly label: string;
}

export interface LinkScan {
  readonly links: readonly ContentLink[];
  readonly malformed: readonly string[];
}

export function scanLinks(text: string): LinkScan {
  const links: ContentLink[] = [];
  const malformed: string[] = [];
  const cleaned = text.replace(
    linkPattern(),
    (whole, kind: string, slug: string, label: string) => {
      const parsed = parsePageRef(`${kind}/${slug}`);
      if (parsed === null) {
        malformed.push(whole);
        return '';
      }
      links.push({ ref: pageRef(parsed.kind, parsed.slug), label });
      return '';
    },
  );
  for (const match of cleaned.matchAll(bracketPairPattern())) {
    malformed.push(match[0]);
  }
  if (cleaned.replace(bracketPairPattern(), '').includes(LINK_OPEN)) {
    malformed.push(LINK_OPEN);
  }
  return { links, malformed };
}

export function toPlainText(text: string): string {
  return text.replace(
    linkPattern(),
    (_whole, _kind: string, _slug: string, label: string) => label,
  );
}

export function keepFirstLinkPerTarget(
  sections: readonly ContentSection[],
): readonly ContentSection[] {
  const seen = new Set<string>();
  return sections.map((section) => ({
    heading: section.heading,
    paragraphs: section.paragraphs.map((paragraph) =>
      paragraph.replace(linkPattern(), (whole, kind: string, slug: string, label: string) => {
        const parsed = parsePageRef(`${kind}/${slug}`);
        if (parsed === null) return whole;
        const ref = pageRef(parsed.kind, parsed.slug);
        if (seen.has(ref)) return label;
        seen.add(ref);
        return whole;
      }),
    ),
  }));
}
