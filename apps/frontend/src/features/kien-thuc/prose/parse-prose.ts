import { pageRef, parsePageRef } from '@org/shared-contracts';
import type { PageRef } from '@org/shared-contracts';

const LINK_PATTERN = /\[\[([a-z-]+)\/([a-z0-9-]+)\|([^\]|]{1,40})\]\]/gu;

export enum ProseNodeKind {
  Text = 'text',
  Link = 'link',
}

export type ProseNode =
  | { readonly kind: ProseNodeKind.Text; readonly text: string }
  | { readonly kind: ProseNodeKind.Link; readonly ref: PageRef; readonly label: string };

function textNodes(text: string): readonly ProseNode[] {
  return text === '' ? [] : [{ kind: ProseNodeKind.Text, text }];
}

export function parseProse(text: string): readonly ProseNode[] {
  const nodes: ProseNode[] = [];
  let textStart = 0;
  for (const match of text.matchAll(LINK_PATTERN)) {
    const [markup, kind, slug, label] = match;
    const parsed = parsePageRef(`${kind}/${slug}`);
    if (!parsed) {
      continue;
    }
    nodes.push(...textNodes(text.slice(textStart, match.index)), {
      kind: ProseNodeKind.Link,
      ref: pageRef(parsed.kind, parsed.slug),
      label,
    });
    textStart = match.index + markup.length;
  }
  nodes.push(...textNodes(text.slice(textStart)));
  return nodes;
}
