import { isPrerendered } from './is-prerendered';

function rootIn(bodyMarkup: string): Element {
  document.body.innerHTML = bodyMarkup;
  const root = document.getElementById('root');
  if (!root) {
    throw new Error('the markup has no #root');
  }
  return root;
}

describe('isPrerendered', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('recognises a root that holds prerendered markup', () => {
    expect(
      isPrerendered(
        rootIn('<div id="root"><!--$--><main><h1>Tử vi là gì</h1></main><!--/$--></div>'),
      ),
    ).toBe(true);
  });

  it('treats the SPA shell root as empty even though the splash sits next to it', () => {
    expect(
      isPrerendered(rootIn('<div id="root"></div><div id="app-splash"><p>Đang tải</p></div>')),
    ).toBe(false);
  });
});
