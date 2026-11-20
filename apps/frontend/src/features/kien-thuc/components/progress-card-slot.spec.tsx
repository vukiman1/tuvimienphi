import { fireEvent, screen, waitFor } from '@testing-library/react';
import { useAuthStore } from '@/stores/auth-store';
import { renderAtRoute } from '@/test-utils/render-at-route';
import type { AnyRouter } from '@tanstack/react-router';
import { FIXTURE_SOURCE } from '../__fixtures__/fixture-source';
import { clearLocalProgress, markLessonRead } from '../progress/local-progress-store';
import {
  PROGRESS_CARD_SNOOZE_KEY,
  readProgressCardSnooze,
} from '../progress/progress-card-snooze-store';
import { ProgressCardSlot } from './progress-card-slot';

const LESSON_ROUTE_PATH = '/kien-thuc/$slug';
const LESSON_PATH = '/kien-thuc/12-cung-tu-vi';
const DAY_MS = 86_400_000;

async function renderSlot(lessonSlug: string | null = '12-cung-tu-vi'): Promise<AnyRouter> {
  const { router } = await renderAtRoute({
    path: LESSON_PATH,
    routePath: LESSON_ROUTE_PATH,
    element: <ProgressCardSlot manifest={FIXTURE_SOURCE.loadManifest()} lessonSlug={lessonSlug} />,
  });
  return router;
}

function signedOut(): void {
  useAuthStore.setState({ user: null, isInitializing: false });
}

beforeEach(() => {
  window.localStorage.clear();
  clearLocalProgress();
  useAuthStore.setState({ user: null, isInitializing: true });
});

describe('ProgressCardSlot', () => {
  it('offers sign-in at the end of a second lesson', async () => {
    markLessonRead('tu-vi-la-gi');
    signedOut();

    await renderSlot();

    expect(await screen.findByText('Bạn đã đọc 2/5 bài.')).toBeTruthy();
  });

  it('stays hidden after one lesson', async () => {
    signedOut();

    await renderSlot();

    expect(screen.queryByText(/Bạn đã đọc/)).toBeNull();
  });

  it('stays hidden for a signed-in reader', async () => {
    markLessonRead('tu-vi-la-gi');
    useAuthStore.setState({ user: { email: 'reader@example.com' }, isInitializing: false });

    await renderSlot();

    expect(screen.queryByText(/Bạn đã đọc/)).toBeNull();
  });

  it('stays hidden while auth is initializing', async () => {
    markLessonRead('tu-vi-la-gi');
    useAuthStore.setState({ user: null, isInitializing: true });

    await renderSlot();

    expect(screen.queryByText(/Bạn đã đọc/)).toBeNull();
  });

  it('opens the sign-in modal without leaving the lesson', async () => {
    markLessonRead('tu-vi-la-gi');
    signedOut();
    const router = await renderSlot();

    fireEvent.click(await screen.findByRole('button', { name: 'Đăng nhập' }));

    await waitFor(() => expect(router.state.location.search.auth).toBe('login'));
    expect(router.state.location.pathname).toBe(LESSON_PATH);
  });

  it('hides for seven days on Để sau and keeps keyboard focus in place', async () => {
    markLessonRead('tu-vi-la-gi');
    signedOut();
    await renderSlot();
    const snooze = await screen.findByRole('button', { name: 'Để sau' });
    const slot = snooze.closest('div[tabindex="-1"]');

    fireEvent.click(snooze);

    await waitFor(() => expect(screen.queryByText(/Bạn đã đọc/)).toBeNull());
    expect(document.activeElement).toBe(slot);
    expect(typeof readProgressCardSnooze()).toBe('number');
  });

  it('comes back once the week has passed', async () => {
    markLessonRead('tu-vi-la-gi');
    signedOut();
    window.localStorage.setItem(PROGRESS_CARD_SNOOZE_KEY, String(Date.now() - 8 * DAY_MS));

    await renderSlot();

    expect(await screen.findByText('Bạn đã đọc 2/5 bài.')).toBeTruthy();
  });
});
