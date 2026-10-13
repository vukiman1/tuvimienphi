import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, App, Flex, Skeleton, Typography } from 'antd';
import type { AiProvider } from '@/gql/graphql';
import { isForbidden, rejectionReason } from '@/lib/graphql-request';
import { AiCallDrawer } from '../components/ai-call-drawer';
import { CALLS_PAGE_SIZE } from '../components/ai-call-model';
import { AI_CATALOG_CHECKED_ON } from '../components/ai-model-catalog';
import { AiUsageCard } from '../components/ai-usage-card';
import {
  USAGE_PURPOSE_LABEL,
  fetchRange,
  reportingDay,
  type DayRange,
  type UsageRow,
} from '../components/ai-usage-model';
import { AiProviderForm, Field, type AiProviderAction } from '../components/ai-provider-form';
import {
  AI_PROVIDER_LABEL,
  modelName,
  sourceNotice,
  startingProvider,
  type AiProviderChange,
} from '../components/ai-provider-model';
import { AiProviderSelect } from '../components/ai-provider-select';
import {
  AI_USAGE_QUERY_KEY,
  aiCallsQuery,
  aiProviderModelsQuery,
  aiSettingsQuery,
  aiUsageQuery,
  checkAiProvider,
  clearAiProviderKey,
  listAiProviderModels,
  saveAiProvider,
  setActiveAiProvider,
  setAiProviderBudget,
  testAiProvider,
  type AiHealthView,
  type AiProviderView,
} from '../data/admin-ai.query';

const LOAD_FAILED = 'Không tải được cấu hình AI.';
const FORBIDDEN = 'Chỉ quản trị viên cấp cao (SUPER_ADMIN) mới quản lý được khoá AI.';
const NO_RESULT = 'Máy chủ không trả về kết quả gọi thử.';
const USAGE_FAILED = 'Không tải được số liệu mức dùng.';
const BUDGET_FAILED = 'Không lưu được hạn mức.';
const CALLS_FAILED = 'Không tải được chi tiết lượt gọi.';
const CALL_RETENTION_DAYS = 90;

interface CallDrill {
  readonly row: UsageRow;
  readonly range: DayRange;
  readonly periodLabel: string;
  readonly page: number;
}
const INTRO =
  'Trang web dùng một AI để viết luận giải. Chọn loại AI, dán khoá, chọn model rồi bấm Lưu.';

export function AiPage() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const [chosen, setChosen] = useState<AiProvider | null>(null);
  const [busy, setBusy] = useState<AiProviderAction | null>(null);
  const [savingBudgetFor, setSavingBudgetFor] = useState<AiProvider | null>(null);
  const [today] = useState(() => reportingDay(new Date()));
  const usageRange = fetchRange(today);
  const usage = useQuery(aiUsageQuery(usageRange.from, usageRange.to));
  const [drill, setDrill] = useState<CallDrill | null>(null);
  const calls = useQuery({
    ...aiCallsQuery({
      from: drill?.range.from ?? today,
      to: drill?.range.to ?? today,
      provider: drill?.row.provider ?? 'GEMINI',
      model: drill?.row.model ?? '',
      purpose: drill?.row.purpose ?? 'GENERATION',
      page: drill?.page ?? 1,
      limit: CALLS_PAGE_SIZE,
    }),
    enabled: drill !== null,
  });
  const settingsQuery = aiSettingsQuery();
  const { data, isPending, isError, error } = useQuery(settingsQuery);
  const settings = data?.aiSettings;
  const selected = settings ? (chosen ?? startingProvider(settings)) : null;
  const view = settings?.providers.find(({ provider }) => provider === selected) ?? null;
  const notice = settings ? sourceNotice(settings) : null;

  const refresh = () => queryClient.invalidateQueries({ queryKey: settingsQuery.queryKey });
  const refreshUsage = () => queryClient.invalidateQueries({ queryKey: AI_USAGE_QUERY_KEY });

  const patchProvider = (provider: AiProvider, change: Partial<AiProviderView>): void => {
    queryClient.setQueryData(settingsQuery.queryKey, (current) =>
      current
        ? {
            aiSettings: {
              ...current.aiSettings,
              providers: current.aiSettings.providers.map((row) =>
                row.provider === provider ? { ...row, ...change } : row,
              ),
            },
          }
        : current,
    );
  };

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
    try {
      const { checkAiProvider: checked } = await checkAiProvider(provider);
      const health = checked.health ?? null;
      if (!health) {
        throw new Error(NO_RESULT);
      }
      patchProvider(provider, { health });
      return health;
    } finally {
      void refreshUsage();
    }
  };

  const test = async (provider: AiProvider, change: AiProviderChange): Promise<AiHealthView> => {
    try {
      return (await testAiProvider({ provider, ...change })).testAiProvider;
    } finally {
      void refreshUsage();
    }
  };

  const setBudget = async (provider: AiProvider, monthlyBudgetUsd: number | null) => {
    setSavingBudgetFor(provider);
    try {
      const { setAiProviderBudget: saved } = await setAiProviderBudget(provider, monthlyBudgetUsd);
      patchProvider(provider, { monthlyBudgetUsd: saved.monthlyBudgetUsd ?? null });
      void message.success(
        monthlyBudgetUsd === null
          ? `Đã bỏ hạn mức của ${AI_PROVIDER_LABEL[provider]}.`
          : `Đã lưu hạn mức của ${AI_PROVIDER_LABEL[provider]}.`,
      );
    } catch (caught) {
      void message.error(rejectionReason(caught) ?? BUDGET_FAILED);
    } finally {
      setSavingBudgetFor(null);
    }
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
    <Flex vertical gap={16}>
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
        <AiProviderSection
          key={`${view.provider}-${view.updatedAt ?? 'unsaved'}`}
          provider={view}
          picker={
            <Field label="Loại AI">
              <AiProviderSelect
                providers={settings.providers}
                value={view.provider}
                onChange={setChosen}
              />
            </Field>
          }
          busy={busy}
          onListModels={async (apiKey) =>
            (await listAiProviderModels(view.provider, apiKey)).aiProviderModels
          }
          onTest={(change) => test(view.provider, change)}
          onCheck={() => check(view.provider)}
          onSave={(change) => save(view.provider, change)}
          onStopUsing={() => void stopUsing(view.provider)}
          onClearKey={() => void clearKey(view.provider)}
        />
      ) : null}

      {settings ? (
        <AiUsageCard
          providers={settings.providers}
          days={usage.data?.aiUsage ?? []}
          today={today}
          pricesCheckedOn={AI_CATALOG_CHECKED_ON}
          isLoading={usage.isPending}
          loadError={usage.isError ? USAGE_FAILED : null}
          savingBudgetFor={savingBudgetFor}
          onSetBudget={(provider, value) => void setBudget(provider, value)}
          onOpenCalls={(row, range, periodLabel) => setDrill({ row, range, periodLabel, page: 1 })}
        />
      ) : null}

      <AiCallDrawer
        isOpen={drill !== null}
        title={
          drill
            ? `${modelName(drill.row.provider, drill.row.model)} · ${USAGE_PURPOSE_LABEL[drill.row.purpose]}`
            : ''
        }
        subtitle={drill ? `${AI_PROVIDER_LABEL[drill.row.provider]} · ${drill.periodLabel}` : ''}
        calls={calls.data?.aiCalls.items ?? []}
        total={calls.data?.aiCalls.total ?? 0}
        expectedTotal={drill?.row.calls ?? 0}
        page={drill?.page ?? 1}
        isLoading={drill !== null && calls.isPending}
        loadError={calls.isError ? CALLS_FAILED : null}
        retentionDays={CALL_RETENTION_DAYS}
        onPageChange={(page) => setDrill((current) => (current ? { ...current, page } : current))}
        onClose={() => setDrill(null)}
      />

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
