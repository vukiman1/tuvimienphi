import type { CSSProperties, ReactElement } from 'react';
import type { LuanGiaiArticle } from '@org/shared-contracts';
import { LuanGiaiAccordion } from '@/features/la-so/components/luan-giai-accordion';
import { LuanGiaiCard, LuanGiaiCardHeader } from '@/features/la-so/components/luan-giai-card';
import { RichText } from '@/features/la-so/components/rich-text';
import { ArticlePainting } from '@/features/la-so/components/article-painting';
import { luanGiaiPainting } from '@/features/la-so/luan-giai-painting';
import { cn } from '@/lib/utils';

interface LuanGiaiArticleCardProps {
  readonly article: LuanGiaiArticle;
  readonly order: string;
  readonly isFresh?: boolean;
}

interface RevealProps {
  readonly className: string;
  readonly style: CSSProperties | undefined;
}

const REVEAL_STEP_MS = 110;
const PARAGRAPH_KEY_LENGTH = 40;
const FIRST_PARAGRAPH_STEP = 2;
const NO_REVEAL: RevealProps = { className: '', style: undefined };

export function LuanGiaiArticleCard({
  article,
  order,
  isFresh,
}: LuanGiaiArticleCardProps): ReactElement {
  const reveal = (step: number): RevealProps =>
    isFresh
      ? {
          className: 'animate-block-in motion-reduce:animate-none',
          style: { animationDelay: `${step * REVEAL_STEP_MS}ms` },
        }
      : NO_REVEAL;
  const summaryStep = FIRST_PARAGRAPH_STEP + article.paragraphs.length;
  const painting = luanGiaiPainting(article.sourceCung);

  return (
    <LuanGiaiCard>
      <LuanGiaiCardHeader eyebrow={article.eyebrow} order={order} title={article.title} />

      {painting === undefined ? null : <ArticlePainting painting={painting} />}

      <div className="mt-6 flex items-center gap-6">
        <blockquote
          className={cn('font-emphasis text-xl font-semibold text-ink italic', reveal(0).className)}
          style={reveal(0).style}
        >
          “{article.quote}”
        </blockquote>
        <span aria-hidden className="hidden h-px flex-1 bg-ink/15 lg:block" />
      </div>

      <h4
        className={cn('mt-6 text-xl font-bold text-ink', reveal(1).className)}
        style={reveal(1).style}
      >
        {article.subheading}
      </h4>

      {article.paragraphs.map((paragraph, index) => (
        <p
          key={paragraph.slice(0, PARAGRAPH_KEY_LENGTH)}
          className={cn('mt-4', reveal(FIRST_PARAGRAPH_STEP + index).className)}
          style={reveal(FIRST_PARAGRAPH_STEP + index).style}
        >
          <RichText text={paragraph} />
        </p>
      ))}

      {article.sections && (
        <LuanGiaiAccordion
          entries={article.sections.map((section) => ({
            id: section.slug,
            title: section.title,
            meta: section.sourceCung,
            paragraphs: section.paragraphs,
          }))}
        />
      )}

      <p
        className={cn('mt-6 rounded-2xl bg-day-200 px-6 py-5', reveal(summaryStep).className)}
        style={reveal(summaryStep).style}
      >
        <RichText text={article.summary} />
      </p>

      <footer
        className={cn('mt-6', reveal(summaryStep + 1).className)}
        style={reveal(summaryStep + 1).style}
      >
        <p className="text-sm text-ink-soft">{article.closingLabel}</p>
        <p className="mt-1 font-emphasis text-xl font-semibold text-dusk italic">
          {article.closing}
        </p>
      </footer>
    </LuanGiaiCard>
  );
}
