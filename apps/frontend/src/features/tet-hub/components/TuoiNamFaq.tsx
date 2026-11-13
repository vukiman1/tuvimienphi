import type { ReactElement } from 'react';
import type { TuoiNamFaq as TuoiNamFaqItem } from '@org/shared-contracts';
import { DisplaySize, DisplayTitle, TitleFace } from '@/design-system';

const FAQ_TITLE_ID = 'tuoi-nam-faq-title';

interface TuoiNamFaqProps {
  readonly faq: readonly TuoiNamFaqItem[];
}

export function TuoiNamFaq({ faq }: TuoiNamFaqProps): ReactElement {
  return (
    <section aria-labelledby={FAQ_TITLE_ID} className="text-ink">
      <DisplayTitle id={FAQ_TITLE_ID} size={DisplaySize.Card} face={TitleFace.Serif}>
        Câu hỏi thường gặp
      </DisplayTitle>
      <div className="mt-4 flex flex-col gap-5">
        {faq.map(({ question, answer }) => (
          <div key={question}>
            <h3 className="text-lg font-bold">{question}</h3>
            <p className="mt-1 text-reading leading-reading text-ink-soft">{answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
