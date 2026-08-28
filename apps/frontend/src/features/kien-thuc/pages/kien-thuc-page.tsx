import { useCallback, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ARTICLES } from '@/features/kien-thuc/kien-thuc-data';
import { KienThucHero } from '@/features/kien-thuc/components/kien-thuc-hero';
import { ALL_FILTER, CategoryNav, type Filter } from '@/features/kien-thuc/components/category-nav';
import { FeaturedCarousel } from '@/features/kien-thuc/components/featured-carousel';
import { ArticleCard } from '@/features/kien-thuc/components/article-card';
import { SectionTitle } from '@/features/kien-thuc/components/section-title';
import { PopularTopics } from '@/features/kien-thuc/components/popular-topics';
import { Handbook } from '@/features/kien-thuc/components/handbook';
import { QuoteCard } from '@/features/kien-thuc/components/quote-card';
import { SocialFollow } from '@/features/kien-thuc/components/social-follow';
import { Reveal } from '@/features/kien-thuc/components/reveal';

const PAGE_SIZE = 6;

const FEATURED_COUNT = 4;

export function KienThucPage() {
  const [active, setActive] = useState<Filter>(ALL_FILTER);
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return ARTICLES.filter((article) => {
      const matchesCategory = active === ALL_FILTER || article.category === active;
      const matchesQuery =
        needle === '' ||
        article.title.toLowerCase().includes(needle) ||
        article.excerpt.toLowerCase().includes(needle);
      return matchesCategory && matchesQuery;
    });
  }, [active, query]);

  // The first few results form the featured carousel; the rest fill the latest grid.
  const featuredPool = filtered.slice(0, FEATURED_COUNT);
  const latest = filtered.slice(featuredPool.length);
  const shown = latest.slice(0, visible);

  // Stable handler refs so the memoized nav/hero don't re-render on unrelated state changes.
  const changeFilter = useCallback((next: Filter) => {
    setActive(next);
    setVisible(PAGE_SIZE);
  }, []);

  const changeQuery = useCallback((next: string) => {
    setQuery(next);
    setVisible(PAGE_SIZE);
  }, []);

  return (
    <main className="font-body text-foreground">
      {/* Serif display for headings (font-display), Noto Serif for body — the site's two-tier type. */}
      <KienThucHero query={query} onQueryChange={changeQuery} />

      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        {/* Pulled up by ~half a chip so the hero's bottom rule runs through the middle of the row. */}
        <div className="relative z-10 -mt-[54px]">
          <CategoryNav active={active} onChange={changeFilter} />
        </div>

        <div className="mt-9 grid gap-8 pb-16 lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            <Reveal>
              {featuredPool.length > 0 ? (
                <section>
                  <SectionTitle title="Bài viết nổi bật" />
                  <div className="mt-5">
                    <FeaturedCarousel
                      key={featuredPool.map((item) => item.slug).join('|')}
                      articles={featuredPool}
                    />
                  </div>
                </section>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#e0cfa5] bg-[#faf5ea] p-12 text-center">
                  <p className="font-display text-[20px] font-semibold text-[#2a1f0e]">
                    Chưa có bài viết phù hợp
                  </p>
                  <p className="mt-2 text-[13px] text-[#8d7a5c]">
                    Thử chọn chủ đề khác hoặc đổi từ khóa tìm kiếm.
                  </p>
                </div>
              )}
            </Reveal>

            {shown.length > 0 && (
              <Reveal delay={100}>
                <section className="mt-10">
                  <SectionTitle title="Bài viết mới nhất" />
                  <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {shown.map((article, index) => (
                      <ArticleCard key={article.slug} article={article} index={index} />
                    ))}
                  </div>

                  {latest.length > visible && (
                    <div className="mt-8 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setVisible((current) => current + PAGE_SIZE)}
                        className="inline-flex items-center gap-2 rounded-full bg-[#9e2b1e] px-6 py-2.5 text-[12px] font-semibold tracking-wide text-[#fdf3dc] uppercase transition-colors hover:bg-[#8a2318] focus-visible:ring-2 focus-visible:ring-[#e0bd76] focus-visible:outline-none"
                      >
                        Xem thêm bài viết
                        <ChevronDown className="size-4" />
                      </button>
                    </div>
                  )}
                </section>
              </Reveal>
            )}
          </div>

          <Reveal delay={150}>
            <aside className="flex flex-col gap-5">
              <PopularTopics />
              <Handbook />
              <QuoteCard />
              <SocialFollow />
            </aside>
          </Reveal>
        </div>
      </div>
    </main>
  );
}
