import type { ReactNode } from 'react';
import { ClaudeFilled, GeminiFilled, KeyOutlined, OpenAIFilled } from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Flex,
  Form,
  Input,
  Popconfirm,
  Select,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { AiProvider } from '@/gql/graphql';
import type { AiProviderView } from '../data/admin-ai.query';
import {
  AI_MODEL_CATALOG,
  MODEL_BADGE_COLOR,
  MODEL_BADGE_LABEL,
  catalogModel,
  defaultModels,
  modelOptionGroups,
} from './ai-model-catalog';
import {
  AI_PROVIDER_LABEL,
  MAX_API_KEY_LENGTH,
  MAX_MODELS,
  MIN_API_KEY_LENGTH,
  canBeUsed,
  friendlyFailure,
  hasUnsavedChanges,
  healthSummary,
  isKnownHealthy,
  isModelId,
  keyPlaceholder,
  providerStatus,
  startingModels,
  type AiProviderFormValues,
} from './ai-provider-model';

export type AiProviderAction = 'SAVE' | 'CHECK' | 'ACTIVATE' | 'CLEAR';

export interface AiProviderChange {
  readonly apiKey: string | null;
  readonly models: string[];
}

interface AiProviderCardProps {
  readonly provider: AiProviderView;
  readonly liveModels: readonly string[];
  readonly liveModelsError: string | null;
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
const ICON_SIZE = 22;
const SAVE_FIRST = 'Lưu khoá và model trước đã.';
const MODELS_HELP = 'Model đầu tiên là model chính; các model sau chỉ dùng khi model trước lỗi.';

const PROVIDER_ICON: Readonly<Record<AiProvider, ReactNode>> = {
  GEMINI: <GeminiFilled style={{ fontSize: ICON_SIZE, color: '#4285f4' }} />,
  OPENAI: <OpenAIFilled style={{ fontSize: ICON_SIZE }} />,
  ANTHROPIC: <ClaudeFilled style={{ fontSize: ICON_SIZE, color: '#d97757' }} />,
};

export function AiProviderCard({
  provider,
  liveModels,
  liveModelsError,
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
  const catalog = AI_MODEL_CATALOG[provider.provider];
  const status = providerStatus(provider);
  const initialValues: AiProviderFormValues = { apiKey: '', models: startingModels(provider) };
  const values = Form.useWatch([], form) ?? initialValues;
  const isDirty = hasUnsavedChanges(provider, values);
  const isReady = canBeUsed(provider) && !isDirty;

  return (
    <Card
      style={{ height: '100%' }}
      title={
        <Flex align="center" gap={10}>
          {PROVIDER_ICON[provider.provider]}
          {label}
        </Flex>
      }
      extra={<Tag color={status.color}>{status.text}</Tag>}
    >
      <Flex vertical gap={16}>
        <HealthPanel
          provider={provider}
          isReady={isReady}
          isChecking={busy === 'CHECK'}
          onCheck={onCheck}
        />

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
            extra={
              <Typography.Link href={catalog.keyUrl} target="_blank" rel="noreferrer">
                Lấy khoá {label} ở đâu?
              </Typography.Link>
            }
            rules={[
              { required: !provider.hasApiKey, whitespace: true, message: 'Dán khoá API.' },
              { min: MIN_API_KEY_LENGTH, message: 'Khoá quá ngắn.' },
              { max: MAX_API_KEY_LENGTH, message: 'Khoá quá dài.' },
              { pattern: NO_WHITESPACE, message: 'Khoá không được có khoảng trắng.' },
            ]}
          >
            <Input.Password
              aria-label={`Khoá API ${label}`}
              prefix={<KeyOutlined />}
              placeholder={keyPlaceholder(provider)}
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="models"
            label="Model"
            extra={
              <Flex vertical gap={4}>
                <span>{liveModelsError ?? MODELS_HELP}</span>
                <Flex gap={16} wrap>
                  <Typography.Link
                    onClick={() =>
                      form.setFieldsValue({ models: defaultModels(provider.provider) })
                    }
                  >
                    Chọn lại model gợi ý
                  </Typography.Link>
                  <Typography.Link href={catalog.docsUrl} target="_blank" rel="noreferrer">
                    Xem tất cả model
                  </Typography.Link>
                </Flex>
              </Flex>
            }
            rules={[
              { required: true, type: 'array', message: 'Chọn ít nhất một model.' },
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
              placeholder="Chọn model, hoặc gõ mã model"
              maxCount={MAX_MODELS}
              tokenSeparators={MODEL_SEPARATORS}
              loading={isLoadingModels}
              options={modelOptionGroups(provider.provider, liveModels)}
              optionRender={(option) => (
                <ModelChoice provider={provider.provider} id={String(option.value)} />
              )}
            />
          </Form.Item>

          <Flex gap={8} wrap align="center">
            <Button type="primary" htmlType="submit" disabled={!isDirty} loading={busy === 'SAVE'}>
              Lưu và kiểm tra
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
                <Button
                  danger
                  type="text"
                  loading={busy === 'CLEAR'}
                  style={{ marginInlineStart: 'auto' }}
                >
                  Xoá khoá
                </Button>
              </Popconfirm>
            ) : null}
          </Flex>
        </Form>
      </Flex>
    </Card>
  );
}

interface HealthPanelProps {
  readonly provider: AiProviderView;
  readonly isReady: boolean;
  readonly isChecking: boolean;
  readonly onCheck: () => void;
}

function HealthPanel({ provider, isReady, isChecking, onCheck }: HealthPanelProps) {
  const { health } = provider;
  const checkButton = (text: string) => (
    <div>
      <Tooltip title={isReady ? null : SAVE_FIRST}>
        <Button size="small" disabled={!isReady} loading={isChecking} onClick={onCheck}>
          {text}
        </Button>
      </Tooltip>
    </div>
  );

  if (!provider.hasApiKey) {
    return (
      <Alert
        type="info"
        showIcon
        title="Chưa có khoá"
        description="Dán khoá API bên dưới. Model gợi ý đã được chọn sẵn, bạn chỉ cần bấm Lưu và kiểm tra."
      />
    );
  }
  if (!health) {
    return (
      <Alert
        type="warning"
        showIcon
        title="Chưa kiểm tra"
        description={
          <Flex vertical gap={8}>
            <span>Bấm Kiểm tra để gọi thử AI này bằng khoá đang lưu.</span>
            {checkButton('Kiểm tra')}
          </Flex>
        }
      />
    );
  }
  if (health.status === 'OK') {
    return (
      <Alert
        type="success"
        showIcon
        title="Hoạt động tốt"
        description={
          <Flex vertical gap={8}>
            <span>{healthSummary(provider.provider, health)}</span>
            {checkButton('Kiểm tra lại')}
          </Flex>
        }
      />
    );
  }
  return (
    <Alert
      type="error"
      showIcon
      title={friendlyFailure(health.error)}
      description={
        <Flex vertical gap={8}>
          <span>{healthSummary(provider.provider, health)}</span>
          {health.error ? (
            <Typography.Paragraph
              type="secondary"
              style={{ margin: 0 }}
              ellipsis={{
                rows: 1,
                expandable: 'collapsible',
                symbol: (isExpanded) => (isExpanded ? 'Thu gọn' : 'Chi tiết'),
              }}
            >
              {health.error}
            </Typography.Paragraph>
          ) : null}
          {checkButton('Kiểm tra lại')}
        </Flex>
      }
    />
  );
}

function ModelChoice({ provider, id }: { readonly provider: AiProvider; readonly id: string }) {
  const known = catalogModel(provider, id);
  if (!known) {
    return id;
  }
  return (
    <Flex vertical gap={2} style={{ paddingBlock: 2 }}>
      <Flex align="center" gap={8} wrap>
        <Typography.Text strong>{known.name}</Typography.Text>
        {known.badge ? (
          <Tag color={MODEL_BADGE_COLOR[known.badge]}>{MODEL_BADGE_LABEL[known.badge]}</Tag>
        ) : null}
      </Flex>
      <Typography.Text type="secondary" style={{ whiteSpace: 'normal' }}>
        {known.note}
      </Typography.Text>
    </Flex>
  );
}
