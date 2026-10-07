import { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Flex,
  Popconfirm,
  Row,
  Select,
  Tag,
  Typography,
} from 'antd';
import type { AiProvider } from '@/gql/graphql';
import { rejectionReason } from '@/lib/graphql-request';
import type { AiHealthView, AiProviderView } from '../data/admin-ai.query';
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
  MAX_MODELS,
  answeredBy,
  canBeSaved,
  canBeTried,
  canBeUsed,
  friendlyFailure,
  hasUnsavedChanges,
  isKnownHealthy,
  startingModels,
  toChange,
  type AiProviderChange,
  type CheckResult,
} from './ai-provider-model';
import { ApiKeyField, type KeyCheck } from './api-key-field';
import { FailureDetail, HealthBar } from './health-bar';
import { SERVER_UNREACHABLE, useHealthMonitor, usePageVisible } from './use-health-monitor';

export type AiProviderAction = 'STOP' | 'CLEAR';

interface AiProviderFormProps {
  readonly provider: AiProviderView;
  readonly picker?: React.ReactNode;
  readonly liveModels: readonly string[];
  readonly busy: AiProviderAction | null;
  readonly onListModels: (apiKey: string | null) => Promise<readonly string[]>;
  readonly onTest: (change: AiProviderChange) => Promise<AiHealthView>;
  readonly onCheck: () => Promise<AiHealthView>;
  readonly onSave: (change: AiProviderChange) => Promise<void>;
  readonly onStopUsing: () => void;
  readonly onClearKey: () => void;
}

type Trial =
  | { readonly status: 'IDLE' }
  | { readonly status: 'RUNNING' }
  | { readonly status: 'DONE'; readonly result: CheckResult; readonly isHoldingSave: boolean };

const IDLE_KEY_CHECK: KeyCheck = { status: 'IDLE' };
const IDLE_TRIAL: Trial = { status: 'IDLE' };
const MODELS_HELP = 'Model đầu tiên được gọi trước; các model sau là dự phòng khi model trước lỗi.';
const KEY_NEEDED = 'Dán khoá API và chọn ít nhất một model trước đã.';
const HELD_NOTE = 'Chưa lưu, vì trang web sẽ không luận giải được với cấu hình này. ';
const TRY_HELP = 'Gọi thử khoá và model đang chọn, kể cả khi chưa lưu.';
const WATCH_HELP = 'Tự gọi thử cấu hình đã lưu mỗi phút, khi trang này đang mở.';
const COLUMN_GUTTER = 16;
const SETTINGS_COLUMN = { xs: 24, lg: 14 } as const;
const CHECKS_COLUMN = { xs: 24, lg: 10 } as const;

export function AiProviderForm({
  provider,
  picker,
  liveModels,
  busy,
  onListModels,
  onTest,
  onCheck,
  onSave,
  onStopUsing,
  onClearKey,
}: AiProviderFormProps) {
  const [apiKey, setApiKey] = useState('');
  const [models, setModels] = useState(() => startingModels(provider));
  const [typedKeyModels, setTypedKeyModels] = useState<readonly string[]>([]);
  const [keyCheck, setKeyCheck] = useState<KeyCheck>(IDLE_KEY_CHECK);
  const [trial, setTrial] = useState<Trial>(IDLE_TRIAL);
  const [isSaving, setIsSaving] = useState(false);
  const [isWatching, setIsWatching] = useState(true);
  const isPageVisible = usePageVisible();

  const label = AI_PROVIDER_LABEL[provider.provider];
  const catalog = AI_MODEL_CATALOG[provider.provider];
  const suggested = catalog.defaults;
  const draft = { apiKey, models };
  const isDirty = hasUnsavedChanges(provider, draft);
  const isWatchable = canBeUsed(provider);
  const isTriable = canBeTried(provider, draft);
  const monitor = useHealthMonitor({
    initial: provider.health ?? null,
    isEnabled: isWatchable && isWatching && isPageVisible,
    onCheck,
  });

  const changeKey = (typed: string): void => {
    setApiKey(typed);
    setTypedKeyModels([]);
    setKeyCheck(IDLE_KEY_CHECK);
    setTrial(IDLE_TRIAL);
  };

  const changeModels = (chosen: string[]): void => {
    setModels(chosen);
    setTrial(IDLE_TRIAL);
  };

  const checkKey = async (): Promise<void> => {
    setKeyCheck({ status: 'CHECKING' });
    try {
      const listed = await onListModels(apiKey || null);
      setTypedKeyModels(apiKey ? listed : []);
      setKeyCheck({ status: 'OK', modelCount: listed.length });
    } catch (caught) {
      setKeyCheck({ status: 'FAILED', reason: rejectionReason(caught) ?? SERVER_UNREACHABLE });
    }
  };

  const tryOut = async (): Promise<CheckResult> => {
    if (!isDirty && isWatchable) {
      return monitor.checkNow();
    }
    try {
      return { health: await onTest(toChange(draft)) };
    } catch (caught) {
      return { failure: rejectionReason(caught) ?? SERVER_UNREACHABLE };
    }
  };

  const tryModels = async (): Promise<void> => {
    setTrial({ status: 'RUNNING' });
    setTrial({ status: 'DONE', result: await tryOut(), isHoldingSave: false });
  };

  const save = async (isForced: boolean): Promise<void> => {
    setIsSaving(true);
    try {
      if (!isForced && (isDirty || !isKnownHealthy(provider))) {
        const result = await tryOut();
        if (!('health' in result) || result.health.status !== 'OK') {
          setTrial({ status: 'DONE', result, isHoldingSave: true });
          return;
        }
      }
      await onSave(toChange(draft));
    } finally {
      setIsSaving(false);
    }
  };

  const trialResult =
    trial.status === 'DONE' ? (
      <TrialResult
        provider={provider.provider}
        trial={trial}
        isSaving={isSaving}
        onSaveAnyway={() => void save(true)}
        onUseSuggested={isSameList(models, suggested) ? null : () => changeModels([...suggested])}
      />
    ) : null;
  const isHoldingSave = trial.status === 'DONE' && trial.isHoldingSave;

  return (
    <Row gutter={[COLUMN_GUTTER, COLUMN_GUTTER]} align="top">
      <Col {...SETTINGS_COLUMN}>
        <Card title="Cấu hình">
          <Flex vertical gap={20}>
            {picker}

            <Field
              label="Khoá API"
              hint={
                <Typography.Link href={catalog.keyUrl} target="_blank" rel="noreferrer">
                  Lấy khoá {label} ở đâu?
                </Typography.Link>
              }
            >
              <ApiKeyField
                label={label}
                savedHint={provider.apiKeyHint ?? null}
                hasSavedKey={provider.hasApiKey}
                value={apiKey}
                check={keyCheck}
                onChange={changeKey}
                onCheck={() => void checkKey()}
              />
            </Field>

            <Field
              label="Model"
              hint={
                <Flex vertical gap={4}>
                  <Typography.Text type="secondary">{MODELS_HELP}</Typography.Text>
                  <Flex gap={16} wrap>
                    <Typography.Link onClick={() => changeModels(defaultModels(provider.provider))}>
                      Chọn lại model gợi ý
                    </Typography.Link>
                    <Typography.Link href={catalog.docsUrl} target="_blank" rel="noreferrer">
                      Xem tất cả model
                    </Typography.Link>
                  </Flex>
                </Flex>
              }
            >
              <Select
                mode="multiple"
                aria-label={`Model ${label}`}
                placeholder="Chọn model"
                maxCount={MAX_MODELS}
                value={models}
                onChange={changeModels}
                options={modelOptionGroups(provider.provider, [...typedKeyModels, ...liveModels])}
                optionRender={(option) => (
                  <ModelChoice provider={provider.provider} id={String(option.value)} />
                )}
                style={{ width: '100%' }}
              />
            </Field>

            {isHoldingSave ? trialResult : null}

            <Divider style={{ margin: 0 }} />

            <Flex align="center" gap={12} wrap>
              <Button
                type="primary"
                size="large"
                disabled={!canBeSaved(provider, draft)}
                loading={isSaving}
                onClick={() => void save(false)}
              >
                Lưu
              </Button>
              <Typography.Text type="secondary">
                {provider.isActive && !isDirty
                  ? `Trang web đang dùng ${label} với cấu hình này.`
                  : `Lưu xong, trang web dùng ${label} để luận giải.`}
              </Typography.Text>

              <Flex gap={4} style={{ marginInlineStart: 'auto' }}>
                {provider.isActive ? (
                  <Popconfirm
                    title={`Ngừng dùng ${label}?`}
                    description="Trang web sẽ quay về khoá trong biến môi trường, hoặc ngừng luận giải nếu không có."
                    okText="Ngừng dùng"
                    cancelText="Huỷ"
                    onConfirm={onStopUsing}
                  >
                    <Button type="text" loading={busy === 'STOP'}>
                      Ngừng dùng
                    </Button>
                  </Popconfirm>
                ) : null}
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
            </Flex>
          </Flex>
        </Card>
      </Col>

      <Col {...CHECKS_COLUMN}>
        <Card title="Kiểm tra">
          <Flex vertical gap={20}>
            <Field label="Gọi thử ngay">
              <Flex align="center" gap={12} wrap>
                <Button
                  disabled={!isTriable}
                  loading={trial.status === 'RUNNING'}
                  onClick={() => void tryModels()}
                >
                  Kiểm tra model
                </Button>
                <Typography.Text type="secondary">
                  {isTriable ? TRY_HELP : KEY_NEEDED}
                </Typography.Text>
              </Flex>
              {isHoldingSave ? null : trialResult}
            </Field>

            <Divider style={{ margin: 0 }} />

            <Field label="Theo dõi liên tục">
              <Typography.Text type="secondary">{WATCH_HELP}</Typography.Text>
              <HealthBar
                provider={provider.provider}
                monitor={monitor}
                isWatchable={isWatchable}
                isDirty={isDirty}
                isOn={isWatching}
                onToggle={setIsWatching}
              />
            </Field>
          </Flex>
        </Card>
      </Col>
    </Row>
  );
}

interface FieldProps {
  readonly label: string;
  readonly hint?: React.ReactNode;
  readonly children: React.ReactNode;
}

export function Field({ label, hint, children }: FieldProps) {
  return (
    <Flex vertical gap={6}>
      <Typography.Text strong>{label}</Typography.Text>
      {children}
      {hint}
    </Flex>
  );
}

interface TrialResultProps {
  readonly provider: AiProvider;
  readonly trial: Extract<Trial, { status: 'DONE' }>;
  readonly isSaving: boolean;
  readonly onSaveAnyway: () => void;
  readonly onUseSuggested: (() => void) | null;
}

function isSameList(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function TrialResult({
  provider,
  trial,
  isSaving,
  onSaveAnyway,
  onUseSuggested,
}: TrialResultProps) {
  const { result, isHoldingSave } = trial;
  const actions =
    isHoldingSave || onUseSuggested ? (
      <Flex gap={8} wrap>
        {onUseSuggested ? (
          <Button size="small" onClick={onUseSuggested}>
            Đổi sang model gợi ý
          </Button>
        ) : null}
        {isHoldingSave ? (
          <Button size="small" danger loading={isSaving} onClick={onSaveAnyway}>
            Vẫn lưu
          </Button>
        ) : null}
      </Flex>
    ) : null;
  const held = isHoldingSave ? HELD_NOTE : '';

  if (!('health' in result)) {
    return (
      <Alert
        type="warning"
        showIcon
        title="Không gọi thử được"
        description={
          <Flex vertical gap={8}>
            <span>
              {held}
              {result.failure}
            </span>
            {isHoldingSave ? (
              <div>
                <Button size="small" danger loading={isSaving} onClick={onSaveAnyway}>
                  Vẫn lưu
                </Button>
              </div>
            ) : null}
          </Flex>
        }
      />
    );
  }
  if (result.health.status === 'OK') {
    return (
      <Alert
        type="success"
        showIcon
        title="Model hoạt động"
        description={`${answeredBy(provider, result.health)}.`}
      />
    );
  }
  return (
    <Alert
      type="error"
      showIcon
      title={friendlyFailure(result.health.error)}
      description={
        <Flex vertical gap={8}>
          {held ? <span>{held}</span> : null}
          {result.health.error ? <FailureDetail raw={result.health.error} /> : null}
          {actions}
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
