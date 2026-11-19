import { ReadableStream } from 'node:stream/web';
import { setImmediate } from 'node:timers';
import { Suspense, type ReactElement } from 'react';
import { renderRootMarkup } from './render-root-markup';

Object.assign(globalThis, { ReadableStream, setImmediate });

const ROOT_ID = 'root';

function LessonTitle(): ReactElement {
  return (
    <>
      <title>Tử vi là gì</title>
      <h1>Tử vi là gì</h1>
    </>
  );
}

class BrokenPageError extends Error {
  constructor() {
    super('the lesson data is missing');
    this.name = 'BrokenPageError';
  }
}

function BrokenPage(): ReactElement {
  throw new BrokenPageError();
}

describe('renderRootMarkup', () => {
  afterEach(() => {
    delete document.documentElement.dataset.renderedAt;
  });

  it('returns only the markup inside the root, leaving head tags out', async () => {
    const markup = await renderRootMarkup(<LessonTitle />, ROOT_ID);

    expect(markup).toBe('<h1>Tử vi là gì</h1>');
  });

  it('stamps the render time the page will hydrate with', async () => {
    await renderRootMarkup(<LessonTitle />, ROOT_ID);

    expect(document.documentElement.dataset.renderedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);
  });

  it('fails with the render error instead of returning the loading fallback', async () => {
    const page = (
      <Suspense fallback={<p>Đang tải</p>}>
        <BrokenPage />
      </Suspense>
    );

    await expect(renderRootMarkup(page, ROOT_ID)).rejects.toThrow(
      /Cannot render the static markup of the app: the lesson data is missing/,
    );
  });
});
