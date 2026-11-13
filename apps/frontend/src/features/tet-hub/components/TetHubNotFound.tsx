import type { ReactElement } from 'react';
import { DisplaySize, DisplayTitle, TextLink, TitleFace } from '@/design-system';
import { TET_HUB_NOT_FOUND_DESCRIPTION, TET_HUB_NOT_FOUND_TITLE } from '../tet-hub-not-found-copy';
import { KIEN_THUC_PATH } from '../tet-hub-paths';

export function TetHubNotFound(): ReactElement {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-20 text-center text-ink md:px-6">
      <DisplayTitle as="h1" size={DisplaySize.Card} face={TitleFace.Serif}>
        {TET_HUB_NOT_FOUND_TITLE}
      </DisplayTitle>
      <p className="text-ink-soft">{TET_HUB_NOT_FOUND_DESCRIPTION}</p>
      <div className="mt-4">
        <TextLink to={KIEN_THUC_PATH}>← Về trang Kiến Thức</TextLink>
      </div>
    </main>
  );
}
