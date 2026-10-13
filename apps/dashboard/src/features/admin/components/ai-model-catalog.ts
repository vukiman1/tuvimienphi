import type { AiProvider } from '@/gql/graphql';

export type ModelBadge = 'RECOMMENDED' | 'STRONGEST' | 'ECONOMY';

export interface CatalogModel {
  readonly id: string;
  readonly name: string;
  readonly note: string;
  readonly badge?: ModelBadge;
}

export interface ProviderCatalog {
  readonly keyUrl: string;
  readonly docsUrl: string;
  readonly defaults: readonly string[];
  readonly models: readonly CatalogModel[];
}

export interface ModelOption {
  readonly value: string;
  readonly label: string;
}

export interface ModelOptionGroup {
  readonly label: string;
  readonly options: ModelOption[];
}

export const AI_CATALOG_CHECKED_ON = '07/10/2026';

export const MODEL_BADGE_LABEL = {
  RECOMMENDED: 'Khuyên dùng',
  STRONGEST: 'Mạnh nhất',
  ECONOMY: 'Nhanh, rẻ',
} as const satisfies Record<ModelBadge, string>;

export const MODEL_BADGE_COLOR = {
  RECOMMENDED: 'green',
  STRONGEST: 'purple',
  ECONOMY: 'blue',
} as const satisfies Record<ModelBadge, string>;

export const AI_MODEL_CATALOG: Readonly<Record<AiProvider, ProviderCatalog>> = {
  GEMINI: {
    keyUrl: 'https://aistudio.google.com/apikey',
    docsUrl: 'https://ai.google.dev/gemini-api/docs/models',
    defaults: ['gemini-3.5-flash-lite', 'gemini-3.8-flash'],
    models: [
      {
        id: 'gemini-3.5-flash-lite',
        name: 'Gemini 3.5 Flash-Lite',
        note: 'Nhanh và rẻ nhất dòng 3.5; là model chính trang web vẫn dùng lâu nay.',
        badge: 'RECOMMENDED',
      },
      {
        id: 'gemini-3.8-flash',
        name: 'Gemini 3.8 Flash',
        note: 'Bản Flash thông minh nhất, nhưng có lúc trả lời chậm hơn giới hạn của luận giải.',
      },
      {
        id: 'gemini-3.1-pro-preview',
        name: 'Gemini 3.1 Pro',
        note: 'Suy luận mạnh nhất nhưng còn là bản preview; gói miễn phí từng không có hạn mức.',
        badge: 'STRONGEST',
      },
      { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash', note: 'Flash đời trước.' },
      {
        id: 'gemini-3.6-flash',
        name: 'Gemini 3.6 Flash',
        note: 'Flash đời trước, cân bằng tốc độ.',
      },
      { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', note: 'Flash đời cũ cho việc thường.' },
      {
        id: 'gemini-3.1-flash-lite',
        name: 'Gemini 3.1 Flash-Lite',
        note: 'Bản lite đời 3.1, chi phí thấp.',
      },
    ],
  },
  OPENAI: {
    keyUrl: 'https://platform.openai.com/api-keys',
    docsUrl: 'https://developers.openai.com/api/docs/models',
    defaults: ['gpt-6.1-sol'],
    models: [
      {
        id: 'gpt-6.1-sol',
        name: 'GPT-6.1 Sol',
        note: 'Gần bằng Astra với giá thấp hơn nhiều ($2 / $10 mỗi triệu token).',
        badge: 'RECOMMENDED',
      },
      {
        id: 'gpt-6-astra',
        name: 'GPT-6 Astra',
        note: 'Mạnh nhất của OpenAI, chậm và đắt hơn ($10 / $50).',
        badge: 'STRONGEST',
      },
      {
        id: 'gpt-6-luna',
        name: 'GPT-6 Luna',
        note: 'Tiết kiệm nhất, cho việc gọn và số lượng lớn ($0,1 / $0,5).',
        badge: 'ECONOMY',
      },
    ],
  },
  ANTHROPIC: {
    keyUrl: 'https://platform.claude.com/settings/keys',
    docsUrl: 'https://platform.claude.com/docs/en/about-claude/models/overview',
    defaults: ['claude-opus-5-5'],
    models: [
      {
        id: 'claude-opus-5-5',
        name: 'Claude Opus 5.5',
        note: 'Anthropic khuyên bắt đầu từ đây ($4 / $20 mỗi triệu token).',
        badge: 'RECOMMENDED',
      },
      {
        id: 'claude-fable-5-1',
        name: 'Claude Fable 5.1',
        note: 'Mạnh nhất của Anthropic, chậm và đắt hơn ($10 / $50).',
        badge: 'STRONGEST',
      },
      {
        id: 'claude-sonnet-5-5',
        name: 'Claude Sonnet 5.5',
        note: 'Cân bằng giữa tốc độ và chất lượng ($2 / $10).',
      },
      {
        id: 'claude-haiku-4-5',
        name: 'Claude Haiku 4.5',
        note: 'Nhanh nhất ($1 / $5); có thể bị ngừng từ sau 15/10/2026.',
        badge: 'ECONOMY',
      },
    ],
  },
};

export function defaultModels(provider: AiProvider): string[] {
  return [...AI_MODEL_CATALOG[provider].defaults];
}

export function catalogModel(provider: AiProvider, id: string): CatalogModel | undefined {
  return AI_MODEL_CATALOG[provider].models.find((model) => model.id === id);
}

export function modelOptionGroups(
  provider: AiProvider,
  liveModels: readonly string[],
): ModelOptionGroup[] {
  const suggested = AI_MODEL_CATALOG[provider].models;
  const known = new Set(suggested.map((model) => model.id));
  const others = liveModels.filter((id) => !known.has(id));

  const groups: ModelOptionGroup[] = [
    { label: 'Gợi ý', options: suggested.map((model) => ({ value: model.id, label: model.name })) },
  ];
  if (others.length > 0) {
    groups.push({
      label: 'Model khác mà khoá này dùng được',
      options: others.map((id) => ({ value: id, label: id })),
    });
  }
  return groups;
}
