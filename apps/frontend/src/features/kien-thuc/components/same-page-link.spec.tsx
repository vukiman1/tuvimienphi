import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderAtRoute } from '@/test-utils/render-at-route';
import { SamePageLink } from './same-page-link';

const PAGE_PATH = '/kien-thuc/thuat-ngu';

async function renderLink(): Promise<Awaited<ReturnType<typeof renderAtRoute>>> {
  const rendered = await renderAtRoute({
    path: PAGE_PATH,
    routePath: PAGE_PATH,
    element: (
      <SamePageLink hash="chu-t" className="link">
        T
      </SamePageLink>
    ),
  });
  await screen.findByRole('link', { name: 'T' });
  return rendered;
}

describe('SamePageLink', () => {
  it('points at the current page, not the site root the base tag resolves to', async () => {
    await renderLink();

    expect(screen.getByRole('link', { name: 'T' }).getAttribute('href')).toBe(`${PAGE_PATH}#chu-t`);
  });

  it('moves to the hash in-app on a plain click', async () => {
    const { router } = await renderLink();

    const isDefaultAllowed = fireEvent.click(screen.getByRole('link', { name: 'T' }));

    expect(isDefaultAllowed).toBe(false);
    await waitFor(() => expect(router.state.location.hash).toBe('chu-t'));
    expect(router.state.location.pathname).toBe(PAGE_PATH);
  });

  it('leaves a modified click to the browser', async () => {
    const { router } = await renderLink();

    const isDefaultAllowed = fireEvent.click(screen.getByRole('link', { name: 'T' }), {
      ctrlKey: true,
    });

    expect(isDefaultAllowed).toBe(true);
    expect(router.state.location.hash).toBe('');
  });
});
