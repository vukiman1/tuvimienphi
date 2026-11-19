import type { ReactNode } from 'react';
import { prerender } from 'react-dom/static';
import { stampRenderTime } from '@/hooks/use-now';

const INLINE_EVERY_BOUNDARY = Number.POSITIVE_INFINITY;
const ERROR_SEPARATOR = '; ';

class RootMarkupError extends Error {
  constructor(reason: string) {
    super(`Cannot render the static markup of the app: ${reason}`);
    this.name = 'RootMarkupError';
  }
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function renderRootMarkup(app: ReactNode, rootId: string): Promise<string> {
  const renderErrors: string[] = [];
  stampRenderTime();
  const { prelude } = await prerender(
    <html lang="vi">
      <body>
        <div id={rootId}>{app}</div>
      </body>
    </html>,
    {
      progressiveChunkSize: INLINE_EVERY_BOUNDARY,
      onError: (error: unknown) => {
        renderErrors.push(describeError(error));
      },
    },
  );
  if (renderErrors.length > 0) {
    throw new RootMarkupError(renderErrors.join(ERROR_SEPARATOR));
  }
  const html = await new Response(prelude).text();
  const root = new DOMParser().parseFromString(html, 'text/html').getElementById(rootId);
  if (!root) {
    throw new RootMarkupError(`the rendered document has no #${rootId} element`);
  }
  return root.innerHTML;
}
