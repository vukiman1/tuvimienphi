import type { ReactElement, ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import {
  ChapterTone,
  Chip,
  DisplaySize,
  DisplayTitle,
  Emphasis,
  Eyebrow,
  FOCUS_RING_CLASS,
  Orbit,
  StoryChapter,
  TextLink,
} from '@/design-system';
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

const ARTICLE_LINK_CLASS = cn('text-ink no-underline', FOCUS_RING_CLASS);

export function KnowledgeChapter(): ReactElement {
  return (
    <StoryChapter id="kien-thuc" tone={ChapterTone.Day} label={CHAPTER_LABELS.knowledge}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 py-24 md:px-12 md:py-32">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="flex max-w-3xl flex-col gap-4">
            <Eyebrow>{KNOWLEDGE.eyebrow}</Eyebrow>
            <DisplayTitle size={DisplaySize.Chapter}>
              {KNOWLEDGE.title} <Emphasis>{KNOWLEDGE.emphasis}</Emphasis>
            </DisplayTitle>
            <p className="text-lg">{KNOWLEDGE.subtitle}</p>
          </div>
          <TextLink to="/kien-thuc">
            {KNOWLEDGE.ctaLabel} <span aria-hidden="true">↗</span>
          </TextLink>
        </div>

        <ArticleLink
          slug={KNOWLEDGE.featured.slug}
          className={cn(
            ARTICLE_LINK_CLASS,
            'grid gap-8 border-y border-ink/30 py-10 md:grid-cols-2 md:gap-14',
          )}
        >
          <span
            aria-hidden="true"
            className="relative grid aspect-[1.45] place-items-center overflow-hidden bg-deep text-gold"
          >
            <Orbit rings={2} className="absolute w-3/4" />
            <span className="font-display text-8xl font-light tracking-display md:text-[11rem]">
              {KNOWLEDGE.featuredNumeral}
            </span>
          </span>
          <span className="flex flex-col items-start gap-5">
            <Chip>{KNOWLEDGE.featuredBadge}</Chip>
            <span className="font-display text-3xl leading-[1.17] font-extrabold tracking-display md:text-5xl">
              {KNOWLEDGE.featured.title}
            </span>
            <span className="text-reading leading-reading text-ink-soft">
              {KNOWLEDGE.featured.excerpt}
            </span>
            <span className="text-xs font-semibold tracking-wider">{KNOWLEDGE.featured.date}</span>
          </span>
        </ArticleLink>

        <ul className="flex flex-col">
          {KNOWLEDGE.more.map((article) => (
            <li key={article.title} className="border-b border-ink/25">
              <ArticleLink
                slug={article.slug}
                className={cn(
                  ARTICLE_LINK_CLASS,
                  'flex flex-col justify-between gap-2 py-7 md:flex-row md:items-center md:gap-6',
                )}
              >
                <span className="font-display text-2xl font-bold tracking-display md:text-3xl">
                  {article.title}
                </span>
                <span className="text-xs font-semibold tracking-wider whitespace-nowrap">
                  {article.date}
                </span>
              </ArticleLink>
            </li>
          ))}
          <li className="pt-8">
            <TextLink to={TET_HUB_PATH}>
              {TET_HUB_LINK_LABEL} <span aria-hidden="true">→</span>
            </TextLink>
          </li>
        </ul>
      </div>
    </StoryChapter>
  );
}
