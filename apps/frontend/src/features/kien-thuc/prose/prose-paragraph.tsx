import { Fragment } from 'react';
import type { ReactElement } from 'react';
import { isPublished } from '../published-pages';
import { ProseNodeKind, parseProse } from './parse-prose';
import type { ProseNode } from './parse-prose';
import { useProse } from './prose-context';
import { TermButton } from './term-button';

interface ProseParagraphProps {
  readonly text: string;
}

export function ProseParagraph({ text }: ProseParagraphProps): ReactElement {
  const { manifest } = useProse();

  const renderNode = (node: ProseNode): ReactElement | string => {
    if (node.kind === ProseNodeKind.Text) {
      return node.text;
    }
    if (!isPublished(manifest, node.ref)) {
      return node.label;
    }
    return <TermButton pageRef={node.ref} label={node.label} />;
  };

  return (
    <p>
      {parseProse(text).map((node, position) => (
        <Fragment key={position}>{renderNode(node)}</Fragment>
      ))}
    </p>
  );
}
