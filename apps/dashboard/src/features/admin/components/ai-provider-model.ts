import type { AiProvider, AiSource } from '@/gql/graphql';
import { formatDateTime } from '@/lib/format-date-time';
import type { AiHealthView, AiProviderView, AiSettingsView } from '../data/admin-ai.query';

export const AI_PROVIDER_LABEL = {
  GEMINI: 'Gemini',
  OPENAI: 'ChatGPT (OpenAI)',
  ANTHROPIC: 'Claude (Anthropic)',
} as const satisfies Record<AiProvider, string>;

export const MAX_MODELS = 8;
export const MIN_API_KEY_LENGTH = 10;
export const MAX_API_KEY_LENGTH = 400;

const MODEL_ID = /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,59}$/;

export interface SourceNotice {
  readonly type: 'success' | 'warning' | 'error';
  readonly title: string;
  readonly description: string;
}

export interface AiProviderFormValues {
  apiKey: string;
  models: string[];
}

export function isModelId(value: string): boolean {
  return MODEL_ID.test(value);
}

export function sourceNotice({ source, providers }: AiSettingsView): SourceNotice {
  const notices: Record<AiSource, () => SourceNotice> = {
    CONSOLE: () => {
      const active = providers.find((provider) => provider.isActive);
      const name = active ? AI_PROVIDER_LABEL[active.provider] : 'nhà cung cấp đã chọn';
      const [primary, ...fallbacks] = active?.models ?? [];
      const models =
        fallbacks.length > 0
          ? `Model chính ${primary}, dự phòng ${fallbacks.join(', ')}.`
          : `Model ${primary ?? 'chưa chọn'}.`;
      return active?.health?.status === 'FAILED'
        ? {
            type: 'warning',
            title: `Trang web đang dùng ${name}, nhưng lần kiểm tra gần nhất thất bại`,
            description: `${models} Luận giải có thể đang báo hệ thống bận.`,
          }
        : { type: 'success', title: `Trang web đang dùng ${name}`, description: models };
    },
    ENVIRONMENT: () => ({
      type: 'warning',
      title: 'Trang web đang dùng khoá Gemini trong biến môi trường',
      description:
        'Chưa nhà cung cấp nào được chọn ở đây. Chọn một nhà cung cấp bên dưới thì console quyết định, không cần sửa biến môi trường nữa.',
    }),
    NONE: () => ({
      type: 'error',
      title: 'Chưa có cấu hình AI nào dùng được',
      description:
        'Luận giải sẽ báo hệ thống bận cho tới khi một nhà cung cấp bên dưới có khoá, có model và được chọn dùng.',
    }),
  };
  return notices[source]();
}

export function healthSummary(health: AiHealthView): string {
  const when = `kiểm tra lúc ${formatDateTime(health.checkedAt)}`;
  if (health.status === 'OK') {
    const parts = [health.model, health.latencyMs === null ? null : `${health.latencyMs} ms`, when];
    return parts.filter(Boolean).join(' · ');
  }
  return [health.error ?? 'Không rõ lý do', when].join(' · ');
}

export function isKnownHealthy(provider: Pick<AiProviderView, 'health'>): boolean {
  return provider.health?.status === 'OK';
}

export function canBeUsed(provider: Pick<AiProviderView, 'hasApiKey' | 'models'>): boolean {
  return provider.hasApiKey && provider.models.length > 0;
}

export function hasUnsavedChanges(
  provider: Pick<AiProviderView, 'models'>,
  values: AiProviderFormValues,
): boolean {
  return (
    values.apiKey.trim() !== '' || JSON.stringify(values.models) !== JSON.stringify(provider.models)
  );
}

export function keyPlaceholder(provider: Pick<AiProviderView, 'hasApiKey' | 'apiKeyHint'>): string {
  return provider.hasApiKey
    ? `Đang lưu khoá kết thúc bằng ${provider.apiKeyHint ?? '…'}. Để trống nếu giữ nguyên`
    : 'Dán khoá API';
}
