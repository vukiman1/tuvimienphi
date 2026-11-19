import type { ReactElement } from 'react';
import { DisplaySize, DisplayTitle, TextLink, TitleFace } from '@/design-system';
import {
  KIEN_THUC_NOT_FOUND_DESCRIPTION,
  KIEN_THUC_NOT_FOUND_TITLE,
} from '../kien-thuc-not-found-copy';
import { KIEN_THUC_PATH } from '../kien-thuc-paths';

export function KienThucNotFound(): ReactElement {
  return (
    <main className="w-full bg-day px-4 py-20 md:px-6">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center text-ink">
        <DisplayTitle as="h1" size={DisplaySize.Card} face={TitleFace.Serif}>
          {KIEN_THUC_NOT_FOUND_TITLE}
        </DisplayTitle>
        <p className="text-ink-soft">{KIEN_THUC_NOT_FOUND_DESCRIPTION}</p>
        <div className="mt-4">
          <TextLink to={KIEN_THUC_PATH}>← Về trang Kiến Thức</TextLink>
        </div>
      </div>
    </main>
  );
}
