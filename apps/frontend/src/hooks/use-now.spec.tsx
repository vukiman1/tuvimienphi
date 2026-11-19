import { act, type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { render, screen } from '@testing-library/react';
import { stampRenderTime, useNow } from './use-now';

const PRERENDERED_AT = new Date(2026, 10, 19, 13, 15, 42);
const VISITED_AT = new Date(2026, 10, 21, 8, 5, 9);

function DayAndHour(): ReactElement {
  const now = useNow();
  return (
    <p>
      {now.getDate()}/{now.getMonth() + 1} {now.getHours()}h
    </p>
  );
}

function setClock(time: Date): void {
  jest.spyOn(Date, 'now').mockReturnValue(time.getTime());
}

describe('useNow', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete document.documentElement.dataset.renderedAt;
    document.body.innerHTML = '';
  });

  it('stamps the prerender wall-clock time to the minute', () => {
    setClock(PRERENDERED_AT);

    stampRenderTime();

    expect(document.documentElement.dataset.renderedAt).toBe('2026-11-19T13:15');
  });

  it('hydrates with the prerender time, then shows the visit time', async () => {
    setClock(PRERENDERED_AT);
    stampRenderTime();
    const container = document.createElement('div');
    container.innerHTML = renderToString(<DayAndHour />);
    document.body.append(container);
    const prerenderedParagraph = container.querySelector('p');
    const consoleError = jest.spyOn(console, 'error');

    setClock(VISITED_AT);
    await act(async () => {
      hydrateRoot(container, <DayAndHour />);
    });

    expect(consoleError).not.toHaveBeenCalled();
    expect(container.querySelector('p')).toBe(prerenderedParagraph);
    expect(prerenderedParagraph?.textContent).toBe('21/11 8h');
  });

  it('shows the current time when nothing was prerendered', () => {
    setClock(VISITED_AT);

    render(<DayAndHour />);

    expect(screen.getByText('21/11 8h')).toBeTruthy();
  });
});
