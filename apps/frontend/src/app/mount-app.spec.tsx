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

  it('hands a hydration mismatch to the recovery handler instead of raising a window error', async () => {
    const container = createContainer('<button type="button">Nội dung cũ</button>');
    const onRecoverableError = jest.fn();
    const onWindowError = jest.fn();
    window.addEventListener('error', onWindowError);

    await act(async () => mountApp(container, <ReadCounter />, { onRecoverableError }));
    window.removeEventListener('error', onWindowError);

    expect(onRecoverableError).toHaveBeenCalledTimes(1);
    expect(onRecoverableError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(onWindowError).not.toHaveBeenCalled();
    expect(within(container).getByRole('button').textContent).toBe('Đã đọc 0 bài');
  });

  it('keeps the prerendered nodes and makes them interactive', async () => {
    const container = createContainer(renderToString(<ReadCounter />));
    const prerenderedButton = within(container).getByRole('button');
    const onRecoverableError = jest.fn();

    await act(async () => mountApp(container, <ReadCounter />, { onRecoverableError }));
    await act(async () => prerenderedButton.click());

    expect(within(container).getByRole('button')).toBe(prerenderedButton);
    expect(prerenderedButton.textContent).toBe(READ_ONE_LABEL);
    expect(onRecoverableError).not.toHaveBeenCalled();
  });

  it('renders the app into an empty root', async () => {
    const container = createContainer('');
    const onRecoverableError = jest.fn();

    await act(async () => mountApp(container, <ReadCounter />, { onRecoverableError }));
    await act(async () => within(container).getByRole('button').click());

    expect(within(container).getByRole('button').textContent).toBe(READ_ONE_LABEL);
    expect(onRecoverableError).not.toHaveBeenCalled();
  });
});
