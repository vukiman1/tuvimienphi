import type { ReactElement } from 'react';
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import {
  CHAPTER_TONE_CLASS,
  type ChapterAnchor,
  ChapterRail,
  ChapterTone,
  CtaButton,
  CtaTone,
  DisplaySize,
  DisplayTitle,
  Emphasis,
  FOCUS_RING_CLASS,
  PageHero,
  ReadingZone,
  StarRating,
  StickyCta,
  StoryChapter,
  StoryProvider,
  TextLink,
  Tile,
  TitleFace,
  useChapterAt,
} from '.';

const HIDDEN_TOKEN = /(^|\s)hidden(\s|$)/;
const DARK_TONES = [ChapterTone.Night, ChapterTone.Deep, ChapterTone.Dusk] as const;
const LIGHT_TONES = [ChapterTone.Ember, ChapterTone.Dawn, ChapterTone.Day] as const;

async function renderInRouter(element: ReactElement): Promise<void> {
  const rootRoute = createRootRoute({ component: () => element });
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  await router.load();
  render(<RouterProvider router={router} />);
}

const HEADER_PROBE: ChapterAnchor = () => 60;

function rectAt(top: number): DOMRect {
  return {
    top,
    bottom: top + 800,
    left: 0,
    right: 100,
    width: 100,
    height: 800,
    x: 0,
    y: top,
    toJSON: () => ({}),
  };
}

function setChapterTops(tops: Readonly<Record<string, number>>): void {
  for (const [id, top] of Object.entries(tops)) {
    const section = document.getElementById(id);
    if (section === null) {
      throw new Error(`No chapter section with id ${id}`);
    }
    jest.spyOn(section, 'getBoundingClientRect').mockReturnValue(rectAt(top));
  }
}

async function scrollTo(tops: Readonly<Record<string, number>>): Promise<void> {
  setChapterTops(tops);
  await act(async () => {
    window.dispatchEvent(new Event('scroll'));
    await new Promise((resolve) => window.requestAnimationFrame(resolve));
  });
}

function HeaderProbe(): ReactElement {
  return <output aria-label="header chapter">{useChapterAt(HEADER_PROBE)?.id ?? 'none'}</output>;
}

function Story({
  lastTone = ChapterTone.Day,
  showFirst = true,
  showLast = true,
}: {
  readonly lastTone?: ChapterTone;
  readonly showFirst?: boolean;
  readonly showLast?: boolean;
}): ReactElement {
  return (
    <StoryProvider>
      <ChapterRail />
      <HeaderProbe />
      {showFirst ? (
        <StoryChapter id="mo-dau" tone={ChapterTone.Night} label="Mở đầu">
          Mở đầu
        </StoryChapter>
      ) : null}
      <StoryChapter id="hieu-dung" tone={ChapterTone.Ember} label="Hiểu đúng">
        Hiểu đúng
      </StoryChapter>
      {showLast ? (
        <StoryChapter id="cau-chuyen" tone={lastTone} label="Câu chuyện của bạn">
          Câu chuyện của bạn
        </StoryChapter>
      ) : null}
    </StoryProvider>
  );
}

function rail(): HTMLElement {
  return screen.getByRole('navigation', { name: 'Các chương' });
}

function currentRailLink(): HTMLElement | undefined {
  return within(rail())
    .getAllByRole('link')
    .find((link) => link.getAttribute('aria-current') === 'location');
}

function currentRailDot(): Element | null | undefined {
  return currentRailLink()?.querySelector('[data-rail-dot]');
}

describe('StoryChapter', () => {
  it('renders a section with its id and tone', () => {
    const { container } = render(
      <StoryChapter id="mo-dau" tone={ChapterTone.Night} label="Mở đầu">
        Mở đầu
      </StoryChapter>,
    );
    const section = container.querySelector('section');

    expect(section?.id).toBe('mo-dau');
    expect(section?.dataset.tone).toBe(ChapterTone.Night);
    expect(section?.className).toContain('bg-night');
  });

  it('pairs every tone with readable text', () => {
    for (const tone of DARK_TONES) {
      expect(CHAPTER_TONE_CLASS[tone]).toContain('text-day');
    }
    for (const tone of LIGHT_TONES) {
      expect(CHAPTER_TONE_CLASS[tone]).toContain('text-ink');
    }
  });
});

describe('DisplayTitle', () => {
  it('sets a title in the serif face when asked, and in Inter Tight otherwise', () => {
    render(
      <>
        <DisplayTitle size={DisplaySize.Card} face={TitleFace.Serif}>
          Lá số của bạn
        </DisplayTitle>
        <DisplayTitle size={DisplaySize.Card}>Lập lá số</DisplayTitle>
      </>,
    );

    expect(screen.getByRole('heading', { name: 'Lá số của bạn' }).className).toContain(
      'font-emphasis',
    );
    expect(screen.getByRole('heading', { name: 'Lập lá số' }).className).toContain('font-display');
  });

  it('paints accent emphasis in dawn gold and plain emphasis in the surrounding colour', () => {
    render(
      <p>
        <Emphasis isAccent>có gì?</Emphasis> <Emphasis>bắt đầu</Emphasis>
      </p>,
    );

    expect(screen.getByText('có gì?').className).toContain('text-dawn');
    expect(screen.getByText('bắt đầu').className).not.toContain('text-dawn');
  });
});

describe('ChapterRail', () => {
  it('lists the chapters as labelled links in document order', () => {
    const { rerender } = render(<Story showFirst={false} />);
    rerender(<Story />);

    const links = within(rail()).getAllByRole('link');
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '#mo-dau',
      '#hieu-dung',
      '#cau-chuyen',
    ]);
    expect(within(rail()).getByRole('link', { name: 'Hiểu đúng' })).toBeTruthy();
  });

  it('drops a chapter that unmounts', () => {
    const { rerender } = render(<Story />);
    rerender(<Story showLast={false} />);

    expect(within(rail()).getAllByRole('link')).toHaveLength(2);
  });

  it('marks the chapter under the viewport centre and follows scrolling', async () => {
    render(<Story />);

    await scrollTo({ 'mo-dau': -900, 'hieu-dung': -100, 'cau-chuyen': 900 });
    expect(currentRailLink()?.getAttribute('href')).toBe('#hieu-dung');

    await scrollTo({ 'mo-dau': -1700, 'hieu-dung': -900, 'cau-chuyen': -100 });
    expect(currentRailLink()?.getAttribute('href')).toBe('#cau-chuyen');
  });

  it('lets the header probe a different line than the rail', async () => {
    render(<Story />);

    await scrollTo({ 'mo-dau': -700, 'hieu-dung': 100, 'cau-chuyen': 900 });

    expect(screen.getByLabelText('header chapter').textContent).toBe('mo-dau');
    expect(currentRailLink()?.getAttribute('href')).toBe('#hieu-dung');
  });

  it('uses ink dots and an ink active dot over a light chapter', async () => {
    render(<Story lastTone={ChapterTone.Day} />);

    await scrollTo({ 'mo-dau': -1700, 'hieu-dung': -900, 'cau-chuyen': -100 });

    expect(rail().className).toContain('text-ink');
    expect(currentRailDot()?.className).toContain('group-aria-[current=location]:bg-current');
  });

  it('uses day dots and a gold active dot over a dark chapter', async () => {
    render(<Story lastTone={ChapterTone.Deep} />);

    await scrollTo({ 'mo-dau': -1700, 'hieu-dung': -900, 'cau-chuyen': -100 });

    expect(rail().className).toContain('text-day');
    expect(currentRailDot()?.className).toContain('group-aria-[current=location]:bg-gold');
  });

  it('numbers every chapter and spells out only the current one', async () => {
    render(<Story />);

    await scrollTo({ 'mo-dau': -900, 'hieu-dung': -100, 'cau-chuyen': 900 });

    const [opening, turn, story] = within(rail()).getAllByRole('link');
    expect(within(opening).getByText('1.')).toBeTruthy();
    expect(within(turn).getByText('2.')).toBeTruthy();
    expect(within(story).getByText('3.')).toBeTruthy();
    expect(within(turn).getByText('Hiểu đúng').className).not.toMatch(HIDDEN_TOKEN);
    expect(within(opening).getByText('Mở đầu').className).toMatch(HIDDEN_TOKEN);
    expect(within(story).getByText('Câu chuyện của bạn').className).toMatch(HIDDEN_TOKEN);
  });

  it('spells out a chapter name on hover and keyboard focus', async () => {
    render(<Story />);

    await scrollTo({ 'mo-dau': -900, 'hieu-dung': -100, 'cau-chuyen': 900 });

    const { className } = within(rail()).getByText('Mở đầu');
    expect(className).toContain('group-hover:inline');
    expect(className).toContain('group-focus-visible:inline');
  });

  it('keeps the fixed rail free of backdrop blur', () => {
    render(<Story />);

    for (const element of rail().querySelectorAll('*')) {
      expect(element.getAttribute('class') ?? '').not.toContain('backdrop-blur');
    }
  });

  it('gives every dot the two-tone focus ring and stays below dialogs', () => {
    render(<Story />);

    expect(rail().className).toContain('z-40');
    for (const link of within(rail()).getAllByRole('link')) {
      expect(link.className).toContain(FOCUS_RING_CLASS);
    }
  });
});

describe('StickyCta', () => {
  it('is a link with the two-tone focus ring', async () => {
    await renderInRouter(<StickyCta to="/">Lập lá số</StickyCta>);

    expect((await screen.findByRole('link', { name: 'Lập lá số' })).className).toContain(
      FOCUS_RING_CLASS,
    );
  });

  it('hides where the mobile nav bar shows and stays below dialogs', async () => {
    await renderInRouter(<StickyCta to="/">Lập lá số</StickyCta>);

    const { className } = await screen.findByRole('link', { name: 'Lập lá số' });
    expect(className).toContain('md:inline-flex');
    expect(className).toContain('z-40');
  });
});

describe('TextLink', () => {
  it('has the two-tone focus ring', async () => {
    await renderInRouter(<TextLink to="/">Xem tất cả</TextLink>);

    expect((await screen.findByRole('link', { name: 'Xem tất cả' })).className).toContain(
      FOCUS_RING_CLASS,
    );
  });

  it('forwards search params to the destination', async () => {
    await renderInRouter(
      <TextLink to="/" search={{ gender: 'nam' }}>
        Lập lá số cho nam mạng
      </TextLink>,
    );

    expect(
      (await screen.findByRole('link', { name: 'Lập lá số cho nam mạng' })).getAttribute('href'),
    ).toContain('gender=nam');
  });
});

describe('TextLink with route params', () => {
  it('fills the route params into the destination', async () => {
    await renderInRouter(
      <TextLink to="/kien-thuc/tu-vi-2027/$slug" params={{ slug: 'tuoi-dan' }}>
        Xem đầy đủ về tuổi Dần năm 2027
      </TextLink>,
    );

    expect(
      (await screen.findByRole('link', { name: 'Xem đầy đủ về tuổi Dần năm 2027' })).getAttribute(
        'href',
      ),
    ).toBe('/kien-thuc/tu-vi-2027/tuoi-dan');
  });
});

describe('PageHero', () => {
  const LONGEST_HUB_TITLE = 'Tử vi tuổi Canh Thìn 2000 năm 2027';

  function renderHero(): HTMLElement {
    render(
      <PageHero
        breadcrumb={<nav aria-label="Đường dẫn">Kiến thức</nav>}
        eyebrow="Tết 2027 · năm Đinh Mùi"
        title={LONGEST_HUB_TITLE}
        lead="Tuổi chỉ cho biết nét chung."
      />,
    );
    return screen.getByRole('heading', { level: 1 });
  }

  it('renders a Night band with the title as the only h1', () => {
    const title = renderHero();

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(title.textContent).toBe(LONGEST_HUB_TITLE);
    const band = title.closest('section');
    expect(band?.className).toContain('bg-night');
    expect(band?.className).toContain('text-day');
    expect(within(band as HTMLElement).getByRole('navigation', { name: 'Đường dẫn' })).toBeTruthy();
  });

  it('hides its ornament from assistive tech', () => {
    const band = renderHero().closest('section') as HTMLElement;

    const ornament = band.querySelector('svg');
    expect(ornament?.getAttribute('aria-hidden')).toBe('true');
  });

  it('sets the title in the preloaded sans face', () => {
    const title = renderHero();

    expect(title.className).toContain('font-display');
    expect(title.className).not.toContain('font-emphasis');
  });

  it('shows its ornament only where it clears the capped title column', () => {
    const title = renderHero();
    const ornament = (title.closest('section') as HTMLElement).querySelector('svg');

    expect(ornament?.getAttribute('class')).toMatch(/(^|\s)hidden(\s|$)/);
    expect(ornament?.getAttribute('class')).toContain('xl:block');
    expect(title.parentElement?.className).toContain('max-w-2xl');
  });

  it('paints its background only from tablet width, lazily, so phones never fetch it', () => {
    render(
      <PageHero
        breadcrumb={<nav aria-label="Đường dẫn">Kiến thức</nav>}
        eyebrow="Tết 2027 · năm Đinh Mùi"
        title={LONGEST_HUB_TITLE}
        painting={{ small: '/tet/hero-night-768.webp', large: '/tet/hero-night-1536.webp' }}
      />,
    );
    const band = screen.getByRole('heading', { level: 1 }).closest('section') as HTMLElement;
    const painting = band.querySelector('img');

    expect(painting?.getAttribute('alt')).toBe('');
    expect(painting?.getAttribute('fetchpriority')).toBe('low');
    expect(painting?.getAttribute('loading')).toBe('lazy');
    expect(painting?.getAttribute('class')).toMatch(/(^|\s)hidden(\s|$)/);
    expect(painting?.getAttribute('class')).toContain('md:block');
    expect(painting?.getAttribute('srcset')).toBe(
      '/tet/hero-night-768.webp 768w, /tet/hero-night-1536.webp 1536w',
    );
    expect(band.querySelector('svg')).toBeNull();
  });

  it('lets the longest hub title wrap instead of overflowing', () => {
    const title = renderHero();

    expect(title.className).toContain('text-balance');
    expect(title.parentElement?.className).toContain('min-w-0');
    expect(title.parentElement?.className).toContain('break-words');
  });

  it('renders the title alone when it has no breadcrumb or eyebrow', () => {
    render(<PageHero title="Lá Số Tử Vi" />);
    const band = screen.getByRole('heading', { level: 1 }).closest('section') as HTMLElement;

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(band.querySelector('nav')).toBeNull();
    expect(band.querySelector('p')).toBeNull();
  });
});

describe('DisplayTitle', () => {
  it('renders the requested heading level', () => {
    render(
      <DisplayTitle as="h1" size={DisplaySize.Hero}>
        Lập lá số tử vi
      </DisplayTitle>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Lập lá số tử vi' })).toBeTruthy();
  });

  it('names the section that points at its id', () => {
    render(
      <section aria-labelledby="tam-tai-title">
        <DisplayTitle id="tam-tai-title" size={DisplaySize.Card}>
          Tam tai
        </DisplayTitle>
      </section>,
    );

    expect(screen.getByRole('region', { name: 'Tam tai' })).toBeTruthy();
  });

  it('never sets a line height that clips stacked Vietnamese marks', () => {
    for (const size of Object.values(DisplaySize)) {
      const { unmount } = render(<DisplayTitle size={size}>LẬP LÁ SỐ CỦA BẠN</DisplayTitle>);

      expect(screen.getByRole('heading').className).not.toMatch(
        /leading-none|leading-\[1\]|leading-\[1\.1\]/,
      );
      unmount();
    }
  });
});

describe('CtaButton', () => {
  it('is a link when it has a destination', async () => {
    await renderInRouter(
      <CtaButton tone={CtaTone.Gold} to="/">
        LẬP LÁ SỐ CỦA BẠN
      </CtaButton>,
    );

    expect(await screen.findByRole('link', { name: 'LẬP LÁ SỐ CỦA BẠN' })).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('is a non-submitting button that fires its handler without a destination', () => {
    const onClick = jest.fn();
    render(
      <CtaButton tone={CtaTone.Outline} onClick={onClick}>
        Tạo lá số của tôi
      </CtaButton>,
    );
    const button = screen.getByRole('button', { name: 'Tạo lá số của tôi' });

    fireEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(button.getAttribute('type')).toBe('button');
    expect(button.className).toContain(FOCUS_RING_CLASS);
  });
});

describe('Tile', () => {
  it('marks only the active tile as current', () => {
    render(
      <>
        <Tile title="Tý" caption="23h–1h" isActive />
        <Tile title="Sửu" caption="1h–3h" />
      </>,
    );

    expect(screen.getByText('Tý').closest('[aria-current]')?.getAttribute('aria-current')).toBe(
      'true',
    );
    expect(screen.getByText('Sửu').closest('[aria-current]')).toBeNull();
  });
});

describe('ReadingZone', () => {
  it('sets reading size, line height and measure on its content', () => {
    render(<ReadingZone>Tử vi 2027 tuổi Ất Hợi</ReadingZone>);

    const { className } = screen.getByText('Tử vi 2027 tuổi Ất Hợi');
    expect(className).toContain('text-reading');
    expect(className).toContain('leading-reading');
    expect(className).toContain('max-w-reading');
  });
});

describe('StarRating', () => {
  it('rates by shape, not by opacity', () => {
    render(<StarRating rating={3} />);

    const rating = screen.getByRole('img', { name: '3 trên 5 sao' });
    const stars = Array.from(rating.querySelectorAll('svg'));
    const tokensOf = (star: Element): readonly string[] =>
      star.getAttribute('class')?.split(/\s+/) ?? [];
    const filled = stars.filter((star) => tokensOf(star).includes('fill-gold'));
    const empty = stars.filter((star) => tokensOf(star).includes('fill-transparent'));
    expect(filled).toHaveLength(3);
    expect(empty).toHaveLength(2);
    for (const star of filled) expect(tokensOf(star)).toContain('text-ink');
    for (const star of empty) expect(tokensOf(star)).toContain('text-ink-soft');
    const allTokens = [rating, ...stars].flatMap(tokensOf);
    expect(allTokens.filter((token) => token.includes('opacity') || token.includes('/'))).toEqual(
      [],
    );
  });
});
