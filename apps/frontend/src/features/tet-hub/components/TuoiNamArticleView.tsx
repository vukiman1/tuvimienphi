import type { ReactElement } from 'react';
import { CHI, conGiapSlug, getYearCanChi, type TuoiNamFacts } from '@org/shared-tu-vi';
import type { TuoiNamArticle } from '@org/shared-contracts';
import { ReadingZone, TextLink } from '@/design-system';
import { Gender } from '@/features/la-so/birth-input';
import { NAM_MANG_ANCHOR, NU_MANG_ANCHOR, TET_HUB_SLUG_ROUTE } from '../tet-hub-paths';
import { tamTaiVerdict, thaiTueVerdict, xongDatVerdict } from '../tuoi-nam-verdicts';
import { ArticleParagraphs } from './ArticleParagraphs';
import { ArticleSection } from './ArticleSection';
import { TetHubGenderCta } from './TetHubCta';

interface TuoiNamArticleViewProps {
  readonly facts: TuoiNamFacts;
  readonly article: TuoiNamArticle;
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

function GenderSubsection({ id, title, gender, paragraphs }: GenderSubsectionProps): ReactElement {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-6">
      <h3 id={`${id}-title`} className="font-display text-xl font-extrabold">
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
      <dt className="font-bold">{label}</dt>
      <dd className="mt-1">{verdict}</dd>
    </div>
  );
}

export function TuoiNamArticleView({ facts, article }: TuoiNamArticleViewProps): ReactElement {
  const chi = CHI[facts.chi];
  const viewYearCanChi = getYearCanChi(facts.viewYear);

  return (
    <ReadingZone>
      <article className="flex flex-col gap-10">
        <ArticleSection id="tong-quan" title={`Tổng quan năm ${facts.viewYear}`}>
          <ArticleParagraphs paragraphs={article.tongQuan} />
        </ArticleSection>

        <ArticleSection id="sao-han" title="Sao chiếu mệnh và hạn">
          <div className="flex flex-col gap-8">
            <GenderSubsection
              id={NAM_MANG_ANCHOR}
              title="Nam mạng"
              gender={Gender.Male}
              paragraphs={article.saoHanNam}
            />
            <GenderSubsection
              id={NU_MANG_ANCHOR}
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
          <div className="mt-4">
            <TextLink to={TET_HUB_SLUG_ROUTE} params={{ slug: conGiapSlug(facts.chi) }}>
              Xem đầy đủ về tuổi {chi} năm {facts.viewYear}
            </TextLink>
          </div>
        </ArticleSection>
      </article>
    </ReadingZone>
  );
}
