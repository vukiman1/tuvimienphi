import type { ReactNode } from 'react';
import { ClaudeFilled, GeminiFilled, OpenAIFilled } from '@ant-design/icons';
import type { AiProvider } from '@/gql/graphql';

const ICON_SIZE = 20;

export const AI_PROVIDER_ICON: Readonly<Record<AiProvider, ReactNode>> = {
  GEMINI: <GeminiFilled style={{ fontSize: ICON_SIZE, color: '#4285f4' }} />,
  OPENAI: <OpenAIFilled style={{ fontSize: ICON_SIZE }} />,
  ANTHROPIC: <ClaudeFilled style={{ fontSize: ICON_SIZE, color: '#d97757' }} />,
};
