import { screen } from '@testing-library/react';
import { FOCUS_RING_CLASS } from '@/design-system';
import { renderAtRoute } from '@/test-utils/render-at-route';
import { KienThucCta } from './kien-thuc-cta';

describe('KienThucCta', () => {
  it('ends on a Night card that leads to the birth form', async () => {
    await renderAtRoute({ path: '/x', routePath: '/x', element: <KienThucCta /> });

    const heading = await screen.findByRole('heading', { name: 'Áp vào lá số của bạn' });
    const link = screen.getByRole('link', { name: 'Lập lá số' });

    expect(heading.closest('section')?.className).toContain('bg-night');
    expect(heading.closest('section')?.className).toContain('text-day');
    expect(link.getAttribute('href')).toBe('/#lap-la-so');
    FOCUS_RING_CLASS.split(' ').forEach((token) => expect(link.className).toContain(token));
  });
});
