import type { ReactElement } from 'react';
import { TetHubNotFound } from '../components/TetHubNotFound';
import { TetHubPageKind, type TetHubSlugPageData } from '../tet-hub-slug-route';
import { TuoiNamPage } from './tuoi-nam-page';

interface TetHubSlugPageProps {
  readonly data: TetHubSlugPageData;
}

export function TetHubSlugPage({ data }: TetHubSlugPageProps): ReactElement {
  if (data.kind === TetHubPageKind.TuoiNam) {
    return <TuoiNamPage facts={data.facts} article={data.article} />;
  }
  return <TetHubNotFound />;
}
