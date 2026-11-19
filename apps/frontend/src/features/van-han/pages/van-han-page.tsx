import type { ReactElement } from 'react';
import { Emphasis, PageHero, PaintingFocus, TextLink } from '@/design-system';
import { VAN_HAN_PAINTING } from '@/features/van-han/van-han-media';
import { ZodiacPicker } from '@/features/van-han/components/zodiac-picker';
import { TET_HUB_LINK_LABEL, TET_HUB_PATH } from '@/features/tet-hub/tet-hub-paths';

export function VanHanPage(): ReactElement {
  return (
    <main className="w-full bg-day">
      <PageHero
        painting={VAN_HAN_PAINTING}
        paintingFocus={PaintingFocus.Middle}
        title={
          <>
            Vận <Emphasis isAccent>Hạn</Emphasis>
          </>
        }
        lead="Chọn con giáp để xem sao chiếu mệnh và vận hạn trong năm theo tuổi."
      >
        <div>
          <TextLink to={TET_HUB_PATH}>{TET_HUB_LINK_LABEL}</TextLink>
        </div>
      </PageHero>
      <section className="mx-auto max-w-6xl bg-day px-4 py-8 md:px-6 md:py-12">
        <ZodiacPicker />
      </section>
    </main>
  );
}
