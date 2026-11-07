import type { ReactElement } from 'react';
import type { TuoiNamFaq as TuoiNamFaqItem } from '@org/shared-contracts';

const FAQ_TITLE_ID = 'tuoi-nam-faq-title';

interface TuoiNamFaqProps {
  readonly faq: readonly TuoiNamFaqItem[];
}

export function TuoiNamFaq({ faq }: TuoiNamFaqProps): ReactElement {
  return (
    <section aria-labelledby={FAQ_TITLE_ID}>
      <h2 id={FAQ_TITLE_ID} className="text-[22px] font-semibold text-[#2a1f0e]">
        Câu hỏi thường gặp
      </h2>
      <div className="mt-4 flex flex-col gap-5">
        {faq.map(({ question, answer }) => (
          <div key={question}>
            <h3 className="text-[17px] font-semibold text-[#2a1f0e]">{question}</h3>
            <p className="mt-1 text-[16px] leading-relaxed text-[#3b2d18]">{answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
