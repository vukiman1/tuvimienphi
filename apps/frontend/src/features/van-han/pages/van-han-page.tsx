import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { ZodiacPicker } from '@/features/van-han/components/zodiac-picker';
import { TET_HUB_LINK_LABEL, TET_HUB_PATH } from '@/features/tet-hub/tet-hub-paths';

export function VanHanPage(): ReactElement {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
      <h1 className="text-3xl font-bold text-foreground">Vận Hạn</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Chọn con giáp để xem sao chiếu mệnh và vận hạn trong năm theo tuổi.
      </p>
      <Link
        className="mt-2 inline-block text-sm font-medium text-foreground underline underline-offset-4"
        to={TET_HUB_PATH}
      >
        {TET_HUB_LINK_LABEL}
      </Link>
      <div className="mt-6">
        <ZodiacPicker />
      </div>
    </main>
  );
}
