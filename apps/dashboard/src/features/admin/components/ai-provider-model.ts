import type { AiProvider, AiSource } from '@/gql/graphql';
import { formatDateTime } from '@/lib/format-date-time';
import type { AiHealthView, AiProviderView, AiSettingsView } from '../data/admin-ai.query';
import { catalogModel, defaultModels } from './ai-model-catalog';

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

export interface ProviderStatus {
  readonly color: 'green' | 'blue' | 'red' | 'gold' | 'default';
  readonly text: string;
}

export interface AiProviderFormValues {
  apiKey: string;
  models: string[];
}

interface FailurePattern {
  readonly matches: RegExp;
  readonly says: string;
}

const FAILURE_PATTERNS: readonly FailurePattern[] = [
  {
    matches: /\b401\b|api key not valid|invalid.{0,20}api key|incorrect api key|authentication/i,
    says: 'Khoá API không đúng hoặc đã bị thu hồi.',
  },
  {
    matches: /billing|insufficient|credit balance|payment/i,
    says: 'Tài khoản hết tiền hoặc chưa bật thanh toán.',
  },
  {
    matches: /\b429\b|quota|rate.?limit|resource_exhausted/i,
    says: 'Hết hạn mức hoặc đang bị giới hạn tốc độ.',
  },
  { matches: /\b403\b|permission/i, says: 'Khoá này không có quyền dùng model đã chọn.' },
  {
    matches: /\b404\b|not.?found|does not exist|unknown model/i,
    says: 'Model không tồn tại, hoặc khoá này không dùng được model đó.',
  },
  {
    matches: /\b(503|529)\b|unavailable|overloaded/i,
    says: 'Nhà cung cấp đang quá tải, thử lại sau ít phút.',
  },
  {
    matches: /timeout|timed out|aborted/i,
    says: 'Model không trả lời trong thời gian chờ, thường là do nhà cung cấp đang quá tải. Thử lại sau, hoặc đặt một model khác lên đầu.',
  },
  { matches: /refused/i, says: 'Model từ chối trả lời yêu cầu thử.' },
];

const UNEXPLAINED_FAILURE = 'Gọi thử không thành công.';

export function isModelId(value: string): boolean {
  return MODEL_ID.test(value);
}

export function modelName(provider: AiProvider, id: string): string {
  return catalogModel(provider, id)?.name ?? id;
}

export function sourceNotice({ source, providers }: AiSettingsView): SourceNotice {
  const notices: Record<AiSource, () => SourceNotice> = {
    CONSOLE: () => {
      const active = providers.find((provider) => provider.isActive);
      const name = active ? AI_PROVIDER_LABEL[active.provider] : 'nhà cung cấp đã chọn';
      const [primary, ...fallbacks] = (active?.models ?? []).map((id) =>
        active ? modelName(active.provider, id) : id,
      );
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
      title: 'Chưa có AI nào dùng được',
      description:
        'Luận giải sẽ báo hệ thống bận cho tới khi một nhà cung cấp bên dưới có khoá và được chọn dùng.',
    }),
  };
  return notices[source]();
}

export function providerStatus(provider: AiProviderView): ProviderStatus {
  if (provider.isActive) {
    return { color: 'green', text: 'Đang dùng cho trang web' };
  }
  if (!provider.hasApiKey) {
    return { color: 'default', text: 'Chưa có khoá' };
  }
  if (provider.health?.status === 'OK') {
    return { color: 'blue', text: 'Sẵn sàng' };
  }
  if (provider.health?.status === 'FAILED') {
    return { color: 'red', text: 'Đang lỗi' };
  }
  return { color: 'gold', text: 'Chưa kiểm tra' };
}

export function friendlyFailure(error: string | null): string {
  if (!error) {
    return UNEXPLAINED_FAILURE;
  }
  return (
    FAILURE_PATTERNS.find((pattern) => pattern.matches.test(error))?.says ?? UNEXPLAINED_FAILURE
  );
}

export function healthSummary(provider: AiProvider, health: AiHealthView): string {
  const when = `Kiểm tra lúc ${formatDateTime(health.checkedAt)}.`;
  if (health.status !== 'OK') {
    return when;
  }
  const model = health.model ? ` bằng ${modelName(provider, health.model)}` : '';
  const speed = health.latencyMs === null ? 'Đã trả lời' : `Trả lời sau ${health.latencyMs} ms`;
  return `${speed}${model}. ${when}`;
}

export function isKnownHealthy(provider: Pick<AiProviderView, 'health'>): boolean {
  return provider.health?.status === 'OK';
}

export function canBeUsed(provider: Pick<AiProviderView, 'hasApiKey' | 'models'>): boolean {
  return provider.hasApiKey && provider.models.length > 0;
}

export function startingModels(provider: Pick<AiProviderView, 'provider' | 'models'>): string[] {
  return provider.models.length > 0 ? [...provider.models] : defaultModels(provider.provider);
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
