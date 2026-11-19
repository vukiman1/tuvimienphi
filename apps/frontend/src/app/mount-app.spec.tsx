import { act, useState, type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { within } from '@testing-library/react';
import { mountApp } from './mount-app';

const READ_ONE_LABEL = 'Đã đọc 1 bài';

function ReadCounter(): ReactElement {
  const [readCount, setReadCount] = useState(0);
  return (
    <button type="button" onClick={() => setReadCount(readCount + 1)}>
      Đã đọc {readCount} bài
    </button>
  );
}

function createContainer(markup: string): HTMLElement {
  const container = document.createElement('div');
  container.innerHTML = markup;
  document.body.append(container);
  return container;
}

describe('mountApp', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('keeps the prerendered nodes and makes them interactive', async () => {
    const container = createContainer(renderToString(<ReadCounter />));
    const prerenderedButton = within(container).getByRole('button');

    await act(async () => mountApp(container, <ReadCounter />));
    await act(async () => prerenderedButton.click());

    expect(within(container).getByRole('button')).toBe(prerenderedButton);
    expect(prerenderedButton.textContent).toBe(READ_ONE_LABEL);
  });

  it('renders the app into an empty root', async () => {
    const container = createContainer('');

    await act(async () => mountApp(container, <ReadCounter />));
    await act(async () => within(container).getByRole('button').click());

    expect(within(container).getByRole('button').textContent).toBe(READ_ONE_LABEL);
  });
});
