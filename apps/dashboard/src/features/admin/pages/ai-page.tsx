import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, App, Card, Flex, Skeleton, Typography } from 'antd';
import type { AiProvider } from '@/gql/graphql';
import { isForbidden, rejectionReason } from '@/lib/graphql-request';
import { AI_CATALOG_CHECKED_ON } from '../components/ai-model-catalog';
import { AiProviderForm, Field, type AiProviderAction } from '../components/ai-provider-form';
import {
  AI_PROVIDER_LABEL,
  sourceNotice,
  startingProvider,
  type AiProviderChange,
} from '../components/ai-provider-model';
import { AiProviderSelect } from '../components/ai-provider-select';
import {
  aiProviderModelsQuery,
  aiSettingsQuery,
  checkAiProvider,
  clearAiProviderKey,
  listAiProviderModels,
  saveAiProvider,
  setActiveAiProvider,
  testAiProvider,
  type AiHealthView,
  type AiProviderView,
} from '../data/admin-ai.query';

const LOAD_FAILED = 'Không tải được cấu hình AI.';
const FORBIDDEN = 'Chỉ quản trị viên cấp cao (SUPER_ADMIN) mới quản lý được khoá AI.';
const NO_RESULT = 'Máy chủ không trả về kết quả gọi thử.';
const INTRO =
  'Trang web dùng một AI để viết luận giải. Chọn loại AI, dán khoá, chọn model rồi bấm Lưu.';
const PAGE_WIDTH = 760;

export function AiPage() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const [chosen, setChosen] = useState<AiProvider | null>(null);
  const [busy, setBusy] = useState<AiProviderAction | null>(null);
  const settingsQuery = aiSettingsQuery();
  const { data, isPending, isError, error } = useQuery(settingsQuery);
  const settings = data?.aiSettings;
  const selected = settings ? (chosen ?? startingProvider(settings)) : null;
  const view = settings?.providers.find(({ provider }) => provider === selected) ?? null;
  const notice = settings ? sourceNotice(settings) : null;

  const refresh = () => queryClient.invalidateQueries({ queryKey: settingsQuery.queryKey });

  const save = async (provider: AiProvider, change: AiProviderChange): Promise<void> => {
    try {
      await saveAiProvider({ provider, ...change });
      await setActiveAiProvider(provider);
      void message.success(`Đã lưu. Trang web dùng ${AI_PROVIDER_LABEL[provider]}.`);
    } catch (caught) {
      void message.error(
        rejectionReason(caught) ?? `Không lưu được ${AI_PROVIDER_LABEL[provider]}.`,
      );
    } finally {
      await refresh();
    }
  };

  const check = async (provider: AiProvider): Promise<AiHealthView> => {
    const { checkAiProvider: checked } = await checkAiProvider(provider);
    const health = checked.health ?? null;
    if (!health) {
      throw new Error(NO_RESULT);
    }
    queryClient.setQueryData(settingsQuery.queryKey, (current) =>
      current
        ? {
            aiSettings: {
              ...current.aiSettings,
              providers: current.aiSettings.providers.map((row) =>
                row.provider === provider ? { ...row, health } : row,
              ),
            },
          }
        : current,
    );
    return health;
  };

  const act = async (
    action: AiProviderAction,
    failure: string,
    work: () => Promise<string>,
  ): Promise<void> => {
    setBusy(action);
    try {
      void message.success(await work());
    } catch (caught) {
      void message.error(rejectionReason(caught) ?? failure);
    } finally {
      await refresh();
      setBusy(null);
    }
  };

  const stopUsing = (provider: AiProvider) =>
    act('STOP', 'Không đổi được AI cho trang web.', async () => {
      await setActiveAiProvider(null);
      return `Đã ngừng dùng ${AI_PROVIDER_LABEL[provider]}.`;
    });

  const clearKey = (provider: AiProvider) =>
    act('CLEAR', `Không xoá được khoá ${AI_PROVIDER_LABEL[provider]}.`, async () => {
      await clearAiProviderKey(provider);
      return `Đã xoá khoá ${AI_PROVIDER_LABEL[provider]}.`;
    });

  return (
    <Flex vertical gap={16} style={{ maxWidth: PAGE_WIDTH }}>
      <Flex vertical gap={4}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          AI
        </Typography.Title>
        <Typography.Text type="secondary">{INTRO}</Typography.Text>
      </Flex>

      {isError ? (
        <Alert type="error" showIcon title={isForbidden(error) ? FORBIDDEN : LOAD_FAILED} />
      ) : null}
      {isPending ? <Skeleton active /> : null}
      {notice ? (
        <Alert type={notice.type} showIcon title={notice.title} description={notice.description} />
      ) : null}

      {settings && view ? (
        <Card>
          <Flex vertical gap={20}>
            <Field label="Loại AI">
              <AiProviderSelect
                providers={settings.providers}
                value={view.provider}
                onChange={setChosen}
              />
            </Field>
            <AiProviderSection
              key={`${view.provider}-${view.updatedAt ?? 'unsaved'}`}
              provider={view}
              busy={busy}
              onListModels={async (apiKey) =>
                (await listAiProviderModels(view.provider, apiKey)).aiProviderModels
              }
              onTest={async (change) =>
                (await testAiProvider({ provider: view.provider, ...change })).testAiProvider
              }
              onCheck={() => check(view.provider)}
              onSave={(change) => save(view.provider, change)}
              onStopUsing={() => void stopUsing(view.provider)}
              onClearKey={() => void clearKey(view.provider)}
            />
          </Flex>
        </Card>
      ) : null}

      {settings ? (
        <Typography.Text type="secondary">
          Model gợi ý lấy từ tài liệu chính thức của ba nhà cung cấp ngày {AI_CATALOG_CHECKED_ON}.
          Bấm Kiểm tra cạnh ô khoá để thấy thêm các model khác mà khoá của bạn dùng được.
        </Typography.Text>
      ) : null}
    </Flex>
  );
}

type AiProviderSectionProps = Omit<React.ComponentProps<typeof AiProviderForm>, 'liveModels'> & {
  readonly provider: AiProviderView;
};

function AiProviderSection({ provider, ...formProps }: AiProviderSectionProps) {
  const models = useQuery({
    ...aiProviderModelsQuery(provider.provider, provider.apiKeyHint ?? null),
    enabled: provider.hasApiKey,
  });

  return (
    <AiProviderForm
      provider={provider}
      liveModels={models.data?.aiProviderModels ?? []}
      {...formProps}
    />
  );
}
