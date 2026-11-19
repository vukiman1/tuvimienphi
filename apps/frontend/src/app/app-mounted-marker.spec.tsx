import { renderToString } from 'react-dom/server';
import { render } from '@testing-library/react';
import { AppMountedMarker } from './app-mounted-marker';

describe('AppMountedMarker', () => {
  afterEach(() => {
    delete document.documentElement.dataset.appMounted;
  });

  it('marks the document once the app has mounted in the browser', () => {
    render(<AppMountedMarker />);

    expect(document.documentElement.dataset.appMounted).toBe('true');
  });

  it('leaves no trace in the prerendered markup', () => {
    const markup = renderToString(<AppMountedMarker />);

    expect(markup).toBe('');
    expect(document.documentElement.dataset.appMounted).toBeUndefined();
  });
});
