import type { ReactElement, ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { CalendarDays, ChevronRight } from 'lucide-react';
import {
  ChapterTone,
  Chip,
  DisplaySize,
  DisplayTitle,
  Eyebrow,
  FOCUS_RING_CLASS,
  StoryChapter,
  TextLink,
  TitleFace,
} from '@/design-system';
import { MEDIA } from '@/config/media';
import { CHAPTER_LABELS, KNOWLEDGE } from '@/features/home/home-content';
import { TET_HUB_LINK_LABEL, TET_HUB_PATH } from '@/features/tet-hub/tet-hub-paths';
import { cn } from '@/lib/utils';

interface ArticleLinkProps {
  readonly slug: string | undefined;
  readonly className: string;
  readonly children: ReactNode;
}

function ArticleLink({ slug, className, children }: ArticleLinkProps): ReactElement {
  if (slug === undefined) {
    return (
      <Link className={className} to="/kien-thuc">
        {children}
      </Link>
    );
  }
  return (
    <Link className={className} params={{ slug }} to="/kien-thuc/$slug">
      {children}
    </Link>
  );
}

interface ArticleDateProps {
  readonly date: string;
}

function ArticleDate({ date }: ArticleDateProps): ReactElement {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
      <CalendarDays aria-hidden="true" className="size-3.5" />
      {date}
    </span>
  );
}

const ARTICLE_LINK_CLASS = cn('text-ink no-underline', FOCUS_RING_CLASS);

export function KnowledgeChapter(): ReactElement {
  return (
    <StoryChapter
      id="kien-thuc"
      tone={ChapterTone.Day}
      label={CHAPTER_LABELS.knowledge}
      className="overflow-hidden"
    >
      <img
        alt=""
        decoding="async"
        fetchPriority="low"
        loading="lazy"
        sizes="100vw"
        src={MEDIA.story.dawnPagodaLarge}
        srcSet={`${MEDIA.story.dawnPagodaSmall} 768w, ${MEDIA.story.dawnPagodaLarge} 1536w`}
        className="pointer-events-none absolute inset-0 -z-10 size-full object-cover object-top-left"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-day/80 lg:bg-transparent lg:bg-linear-to-b lg:from-day lg:via-transparent lg:to-day"
      />
      <div className="mx-auto grid w-full max-w-7xl items-start gap-10 px-6 py-24 md:px-12 md:py-32 lg:grid-cols-12 lg:gap-8 lg:pr-32 2xl:pr-12">
        <div className="flex flex-col items-start gap-4 lg:col-span-3">
          <Eyebrow>{KNOWLEDGE.eyebrow}</Eyebrow>
          <DisplayTitle size={DisplaySize.Card} face={TitleFace.Serif}>
            {KNOWLEDGE.title}
          </DisplayTitle>
          <p>{KNOWLEDGE.subtitle}</p>
          <TextLink to="/kien-thuc">
            {KNOWLEDGE.ctaLabel} <span aria-hidden="true">→</span>
          </TextLink>
        </div>

        <ArticleLink
          slug={KNOWLEDGE.featured.slug}
          className={cn(
            ARTICLE_LINK_CLASS,
            'grid gap-5 rounded-2xl border border-ink/10 bg-day-200/60 p-4 shadow-lg sm:grid-cols-5 lg:col-span-5',
          )}
        >
          <img
            alt=""
            decoding="async"
            loading="lazy"
            sizes="(min-width: 640px) 13rem, 100vw"
            src={MEDIA.story.starChartLarge}
            srcSet={`${MEDIA.story.starChartSmall} 400w, ${MEDIA.story.starChartLarge} 800w`}
            className="aspect-square w-full rounded-xl object-cover sm:col-span-2"
          />
          <span className="flex flex-col items-start gap-3 sm:col-span-3">
            <Chip>{KNOWLEDGE.featuredBadge}</Chip>
            <span className="font-emphasis text-2xl leading-snug font-bold">
              {KNOWLEDGE.featured.title}
            </span>
            <span className="text-sm leading-relaxed text-ink-soft">
              {KNOWLEDGE.featured.excerpt}
            </span>
            <ArticleDate date={KNOWLEDGE.featured.date} />
          </span>
        </ArticleLink>

        <ul className="flex flex-col lg:col-span-4">
          {KNOWLEDGE.more.map((article) => (
            <li key={article.title} className="border-b border-ink/15">
              <ArticleLink
                slug={article.slug}
                className={cn(ARTICLE_LINK_CLASS, 'flex items-center justify-between gap-4 py-4')}
              >
                <span className="flex flex-col gap-1.5">
                  <span className="font-semibold">{article.title}</span>
                  <ArticleDate date={article.date} />
                </span>
                <ChevronRight aria-hidden="true" className="size-4 shrink-0" />
              </ArticleLink>
            </li>
          ))}
          <li className="pt-5">
            <TextLink to={TET_HUB_PATH}>
              {TET_HUB_LINK_LABEL} <span aria-hidden="true">→</span>
            </TextLink>
          </li>
        </ul>
      </div>
    </StoryChapter>
  );
}
