import type { AiProvider, AiSource } from '@/gql/graphql';
import { formatDateTime, formatTime } from '@/lib/format-date-time';
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
const MILLISECONDS_PER_SECOND = 1000;
const secondsFormatter = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 });

export interface SourceNotice {
  readonly type: 'success' | 'warning' | 'error';
  readonly title: string;
  readonly description: string;
}

export interface ProviderStatus {
  readonly color: 'green' | 'blue' | 'red' | 'gold' | 'default';
  readonly text: string;
}

export interface AiProviderDraft {
  readonly apiKey: string;
  readonly models: readonly string[];
}

export interface AiProviderChange {
  readonly apiKey: string | null;
  readonly models: string[];
}

export type CheckResult = { readonly health: AiHealthView } | { readonly failure: string };

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
    matches: /\b(503|529)\b|unavailable|overloaded|high demand|try again later/i,
    says: 'Model này đang quá tải ở phía nhà cung cấp. Thử lại sau ít phút, hoặc chọn model khác.',
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
        'Chưa có AI nào được lưu ở đây. Chọn loại AI, dán khoá rồi bấm Lưu thì console quyết định, không cần sửa biến môi trường nữa.',
    }),
    NONE: () => ({
      type: 'error',
      title: 'Chưa có AI nào dùng được',
      description: 'Luận giải sẽ báo hệ thống bận cho tới khi một AI bên dưới có khoá và được lưu.',
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

export function formatLatency(latencyMs: number): string {
  return latencyMs < MILLISECONDS_PER_SECOND
    ? `${latencyMs} ms`
    : `${secondsFormatter.format(latencyMs / MILLISECONDS_PER_SECOND)} giây`;
}

export function answeredBy(provider: AiProvider, health: AiHealthView): string {
  const speed =
    health.latencyMs === null ? 'đã trả lời' : `trả lời sau ${formatLatency(health.latencyMs)}`;
  return health.model ? `${modelName(provider, health.model)} ${speed}` : `Model ${speed}`;
}

export function healthSummary(provider: AiProvider, health: AiHealthView): string {
  const when = `Kiểm tra lúc ${formatDateTime(health.checkedAt)}.`;
  return health.status === 'OK' ? `${answeredBy(provider, health)}. ${when}` : when;
}

export function sampleLabel(provider: AiProvider, health: AiHealthView): string {
  const when = formatTime(health.checkedAt);
  return health.status === 'OK'
    ? `${when} · ${answeredBy(provider, health)}`
    : `${when} · ${friendlyFailure(health.error)}`;
}

export function isKnownHealthy(provider: Pick<AiProviderView, 'health'>): boolean {
  return provider.health?.status === 'OK';
}

export function canBeUsed(provider: Pick<AiProviderView, 'hasApiKey' | 'models'>): boolean {
  return provider.hasApiKey && provider.models.length > 0;
}

export function startingProvider({ providers }: Pick<AiSettingsView, 'providers'>): AiProvider {
  const active = providers.find((provider) => provider.isActive);
  if (active) {
    return active.provider;
  }
  const [latest] = providers
    .filter((provider) => provider.hasApiKey)
    .sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
  return latest?.provider ?? 'GEMINI';
}

export function startingModels(provider: Pick<AiProviderView, 'provider' | 'models'>): string[] {
  return provider.models.length > 0 ? [...provider.models] : defaultModels(provider.provider);
}

export function cleanApiKey(typed: string): string {
  return typed.replace(/\s+/g, '');
}

export function keyProblem(apiKey: string): string | null {
  if (apiKey.length < MIN_API_KEY_LENGTH) {
    return 'Khoá quá ngắn.';
  }
  return apiKey.length > MAX_API_KEY_LENGTH ? 'Khoá quá dài.' : null;
}

export function hasUsableKey(
  provider: Pick<AiProviderView, 'hasApiKey'>,
  draft: Pick<AiProviderDraft, 'apiKey'>,
): boolean {
  return draft.apiKey === '' ? provider.hasApiKey : keyProblem(draft.apiKey) === null;
}

export function hasUnsavedChanges(
  provider: Pick<AiProviderView, 'models'>,
  draft: AiProviderDraft,
): boolean {
  return draft.apiKey !== '' || JSON.stringify(draft.models) !== JSON.stringify(provider.models);
}

export function canBeTried(
  provider: Pick<AiProviderView, 'hasApiKey'>,
  draft: AiProviderDraft,
): boolean {
  return hasUsableKey(provider, draft) && draft.models.length > 0;
}

export function canBeSaved(
  provider: Pick<AiProviderView, 'hasApiKey' | 'models' | 'isActive'>,
  draft: AiProviderDraft,
): boolean {
  return canBeTried(provider, draft) && (hasUnsavedChanges(provider, draft) || !provider.isActive);
}

export function toChange(draft: AiProviderDraft): AiProviderChange {
  return { apiKey: draft.apiKey || null, models: [...draft.models] };
}
