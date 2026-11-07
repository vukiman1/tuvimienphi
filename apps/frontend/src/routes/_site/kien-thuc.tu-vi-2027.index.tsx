import type { ReactElement } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import type { TetHubIntro } from '@org/shared-contracts';
import { TetHubPage } from '@/features/tet-hub/pages/tet-hub-page';
import { tetHubHead } from '@/features/tet-hub/tet-hub-head';

async function loadIntro(): Promise<TetHubIntro | undefined> {
  const { loadHubIntro } = await import('@/features/tet-hub/tet-hub-content');
  return loadHubIntro();
}

function TetHubRoute(): ReactElement {
  return <TetHubPage intro={Route.useLoaderData()} />;
}

export const Route = createFileRoute('/_site/kien-thuc/tu-vi-2027/')({
  loader: loadIntro,
  head: tetHubHead,
  component: TetHubRoute,
});
