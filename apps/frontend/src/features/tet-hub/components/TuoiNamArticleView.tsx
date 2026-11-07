import type { ReactElement, ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { CHI, conGiapSlug, getYearCanChi, type TuoiNamFacts } from '@org/shared-tu-vi';
import type { TuoiNamArticle } from '@org/shared-contracts';
import { Gender } from '@/features/la-so/birth-input';
import { tetHubPagePath } from '../tet-hub-paths';
import { tamTaiVerdict, thaiTueVerdict, xongDatVerdict } from '../tuoi-nam-verdicts';
import { ArticleParagraphs } from './ArticleParagraphs';
import { TetHubGenderCta } from './TetHubCta';

interface TuoiNamArticleViewProps {
  readonly facts: TuoiNamFacts;
  readonly article: TuoiNamArticle;
}

interface ArticleSectionProps {
  readonly id: string;
  readonly title: string;
  readonly children: ReactNode;
}

interface GenderSubsectionProps {
  readonly id: string;
  readonly title: string;
  readonly gender: Gender;
  readonly paragraphs: readonly string[];
}

interface VerdictProps {
  readonly label: string;
  readonly verdict: string;
}

function ArticleSection({ id, title, children }: ArticleSectionProps): ReactElement {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-6">
      <h2 id={`${id}-title`} className="text-[22px] leading-snug font-semibold text-[#2a1f0e]">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function GenderSubsection({ id, title, gender, paragraphs }: GenderSubsectionProps): ReactElement {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-6">
      <h3 id={`${id}-title`} className="text-[18px] font-semibold text-[#2a1f0e]">
        {title}
      </h3>
      <div className="mt-3">
        <ArticleParagraphs paragraphs={paragraphs} />
      </div>
      <div className="mt-3">
        <TetHubGenderCta gender={gender} />
      </div>
    </section>
  );
}

function Verdict({ label, verdict }: VerdictProps): ReactElement {
  return (
    <div>
      <dt className="font-semibold text-[#2a1f0e]">{label}</dt>
      <dd className="mt-1">{verdict}</dd>
    </div>
  );
}

export function TuoiNamArticleView({ facts, article }: TuoiNamArticleViewProps): ReactElement {
  const chi = CHI[facts.chi];
  const viewYearCanChi = getYearCanChi(facts.viewYear);

  return (
    <article className="flex flex-col gap-10 rounded-2xl border border-[#e7d9bf] bg-[#fffaf0] px-5 py-7 text-[17px] leading-relaxed text-[#3b2d18] md:px-8">
      <ArticleSection id="tong-quan" title={`Tổng quan năm ${facts.viewYear}`}>
        <ArticleParagraphs paragraphs={article.tongQuan} />
      </ArticleSection>

      <ArticleSection id="sao-han" title="Sao chiếu mệnh và hạn">
        <div className="flex flex-col gap-8">
          <GenderSubsection
            id="nam-mang"
            title="Nam mạng"
            gender={Gender.Male}
            paragraphs={article.saoHanNam}
          />
          <GenderSubsection
            id="nu-mang"
            title="Nữ mạng"
            gender={Gender.Female}
            paragraphs={article.saoHanNu}
          />
        </div>
      </ArticleSection>

      <ArticleSection
        id="menh"
        title={`Mệnh ${facts.menh.name} và năm ${viewYearCanChi} (${facts.menhNam.name})`}
      >
        <ArticleParagraphs paragraphs={article.menh} />
      </ArticleSection>

      <ArticleSection id="cuoi-hoi-lam-nha" title="Cưới hỏi, làm nhà">
        <ArticleParagraphs paragraphs={article.cuoiNha} />
      </ArticleSection>

      <ArticleSection id="loi-khuyen" title={`Lời khuyên cho năm ${facts.viewYear}`}>
        <ArticleParagraphs paragraphs={article.loiKhuyen} />
      </ArticleSection>

      <ArticleSection id="tam-tai-thai-tue-xong-dat" title="Tam tai, Thái tuế, xông đất">
        <dl className="flex flex-col gap-4">
          <Verdict label="Tam tai" verdict={tamTaiVerdict(facts)} />
          <Verdict label="Thái tuế" verdict={thaiTueVerdict(facts)} />
          <Verdict label="Xông đất" verdict={xongDatVerdict(facts)} />
        </dl>
        <Link
          to={tetHubPagePath(conGiapSlug(facts.chi))}
          className="mt-4 inline-block font-semibold text-[#9e2b1e] underline-offset-4 hover:underline"
        >
          Xem đầy đủ về tuổi {chi} năm {facts.viewYear}
        </Link>
      </ArticleSection>
    </article>
  );
}
