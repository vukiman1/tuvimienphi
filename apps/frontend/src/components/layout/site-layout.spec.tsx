import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { ChapterTone, StoryChapter } from '@/design-system';
import { useAuthStore } from '@/stores/auth-store';
import { SiteLayout } from './site-layout';

describe('SiteLayout', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isInitializing: false });
  });

  it('lets a page story reach the site header', async () => {
    const rootRoute = createRootRoute({ component: SiteLayout });
    const storyRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/',
      component: () => (
        <StoryChapter id="mo-dau" tone={ChapterTone.Night} label="Mở đầu">
          Mở đầu
        </StoryChapter>
      ),
    });
    const router = createRouter({
      routeTree: rootRoute.addChildren([storyRoute]),
      history: createMemoryHistory({ initialEntries: ['/'] }),
    });
    await router.load();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    );

    await screen.findByText('Mở đầu');
    expect(screen.getByRole('banner').className).toContain('fixed');
  });
});
