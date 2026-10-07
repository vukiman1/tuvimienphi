import { Badge, Button, Card, Flex, Form, Input, Popconfirm, Select, Tag, Tooltip } from 'antd';
import type { AiProviderView } from '../data/admin-ai.query';
import {
  AI_PROVIDER_LABEL,
  MAX_API_KEY_LENGTH,
  MAX_MODELS,
  MIN_API_KEY_LENGTH,
  canBeUsed,
  hasUnsavedChanges,
  healthSummary,
  isKnownHealthy,
  isModelId,
  keyPlaceholder,
  type AiProviderFormValues,
} from './ai-provider-model';

export type AiProviderAction = 'SAVE' | 'CHECK' | 'ACTIVATE' | 'CLEAR';

export interface AiProviderChange {
  readonly apiKey: string | null;
  readonly models: string[];
}

interface AiProviderCardProps {
  readonly provider: AiProviderView;
  readonly modelOptions: readonly string[];
  readonly modelOptionsError: string | null;
  readonly isLoadingModels: boolean;
  readonly busy: AiProviderAction | null;
  readonly onSave: (change: AiProviderChange) => void;
  readonly onCheck: () => void;
  readonly onActivate: () => void;
  readonly onDeactivate: () => void;
  readonly onClearKey: () => void;
}

const NO_WHITESPACE = /^\S+$/;
const MODEL_SEPARATORS = [',', ' '];
const SAVE_FIRST = 'Lưu khoá và ít nhất một model trước.';
const MODELS_HELP = 'Thử lần lượt theo thứ tự; model đầu tiên là model chính.';

export function AiProviderCard({
  provider,
  modelOptions,
  modelOptionsError,
  isLoadingModels,
  busy,
  onSave,
  onCheck,
  onActivate,
  onDeactivate,
  onClearKey,
}: AiProviderCardProps) {
  const [form] = Form.useForm<AiProviderFormValues>();
  const label = AI_PROVIDER_LABEL[provider.provider];
  const initialValues: AiProviderFormValues = { apiKey: '', models: [...provider.models] };
  const values = Form.useWatch([], form) ?? initialValues;
  const isDirty = hasUnsavedChanges(provider, values);
  const isReady = canBeUsed(provider) && !isDirty;

  return (
    <Card
      title={label}
      extra={provider.isActive ? <Tag color="green">Đang dùng cho trang web</Tag> : null}
    >
      <Flex align="center" justify="space-between" gap={12} wrap style={{ marginBottom: 16 }}>
        <HealthBadge provider={provider} />
        <Tooltip title={isReady ? null : SAVE_FIRST}>
          <Button disabled={!isReady} loading={busy === 'CHECK'} onClick={onCheck}>
            Kiểm tra
          </Button>
        </Tooltip>
      </Flex>

      <Form<AiProviderFormValues>
        form={form}
        layout="vertical"
        initialValues={initialValues}
        autoComplete="off"
        onFinish={(submitted) =>
          onSave({ apiKey: submitted.apiKey.trim() || null, models: submitted.models })
        }
      >
        <Form.Item
          name="apiKey"
          label="Khoá API"
          rules={[
            { required: !provider.hasApiKey, whitespace: true, message: 'Dán khoá API.' },
            { min: MIN_API_KEY_LENGTH, message: 'Khoá quá ngắn.' },
            { max: MAX_API_KEY_LENGTH, message: 'Khoá quá dài.' },
            { pattern: NO_WHITESPACE, message: 'Khoá không được có khoảng trắng.' },
          ]}
        >
          <Input.Password
            aria-label={`Khoá API ${label}`}
            placeholder={keyPlaceholder(provider)}
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          name="models"
          label="Model"
          extra={modelOptionsError ?? MODELS_HELP}
          rules={[
            {
              validator: async (_rule, models: string[]) => {
                if (models.some((model) => !isModelId(model))) {
                  throw new Error('Có giá trị không phải mã model.');
                }
              },
            },
          ]}
        >
          <Select
            mode="tags"
            aria-label={`Model ${label}`}
            placeholder="Chọn hoặc gõ mã model"
            maxCount={MAX_MODELS}
            tokenSeparators={MODEL_SEPARATORS}
            loading={isLoadingModels}
            options={modelOptions.map((model) => ({ value: model, label: model }))}
          />
        </Form.Item>

        <Flex gap={8} wrap>
          <Button type="primary" htmlType="submit" disabled={!isDirty} loading={busy === 'SAVE'}>
            Lưu
          </Button>

          {provider.isActive ? (
            <Popconfirm
              title={`Ngừng dùng ${label}?`}
              description="Trang web sẽ quay về khoá trong biến môi trường, hoặc ngừng luận giải nếu không có."
              okText="Ngừng dùng"
              cancelText="Huỷ"
              onConfirm={onDeactivate}
            >
              <Button loading={busy === 'ACTIVATE'}>Ngừng dùng</Button>
            </Popconfirm>
          ) : (
            <Popconfirm
              disabled={!isReady || isKnownHealthy(provider)}
              title={`Dùng ${label} khi chưa kiểm tra được?`}
              description="Lần kiểm tra gần nhất chưa thành công, nên trang web có thể không sinh được luận giải."
              okText="Vẫn dùng"
              cancelText="Huỷ"
              onConfirm={onActivate}
            >
              <Tooltip title={isReady ? null : SAVE_FIRST}>
                <Button
                  disabled={!isReady}
                  loading={busy === 'ACTIVATE'}
                  onClick={isKnownHealthy(provider) ? onActivate : undefined}
                >
                  Dùng cho trang web
                </Button>
              </Tooltip>
            </Popconfirm>
          )}

          {provider.hasApiKey ? (
            <Popconfirm
              title={`Xoá khoá ${label}?`}
              description={
                provider.isActive
                  ? 'Trang web đang dùng khoá này và sẽ ngừng dùng ngay.'
                  : 'Khoá bị xoá khỏi hệ thống, không khôi phục được.'
              }
              okText="Xoá khoá"
              cancelText="Huỷ"
              okButtonProps={{ danger: true }}
              onConfirm={onClearKey}
            >
              <Button danger type="text" loading={busy === 'CLEAR'}>
                Xoá khoá
              </Button>
            </Popconfirm>
          ) : null}
        </Flex>
      </Form>
    </Card>
  );
}

function HealthBadge({ provider }: { readonly provider: AiProviderView }) {
  if (!provider.hasApiKey) {
    return <Badge status="default" text="Chưa có khoá" />;
  }
  if (!provider.health) {
    return <Badge status="default" text="Chưa kiểm tra" />;
  }
  return provider.health.status === 'OK' ? (
    <Badge status="success" text={`Hoạt động · ${healthSummary(provider.health)}`} />
  ) : (
    <Badge status="error" text={`Lỗi · ${healthSummary(provider.health)}`} />
  );
}
