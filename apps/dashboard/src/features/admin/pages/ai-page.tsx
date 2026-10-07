import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, App, Button, Col, Flex, Row, Skeleton, Typography } from 'antd';
import type { AiProvider } from '@/gql/graphql';
import { isForbidden, rejectionReason } from '@/lib/graphql-request';
import {
  AiProviderCard,
  type AiProviderAction,
  type AiProviderChange,
} from '../components/ai-provider-card';
import { AI_CATALOG_CHECKED_ON } from '../components/ai-model-catalog';
import { AI_PROVIDER_LABEL, canBeUsed, sourceNotice } from '../components/ai-provider-model';
import {
  aiProviderModelsQuery,
  aiSettingsQuery,
  checkAiProvider,
  clearAiProviderKey,
  saveAiProvider,
  setActiveAiProvider,
  type AiProviderView,
} from '../data/admin-ai.query';

const LOAD_FAILED = 'Không tải được cấu hình AI.';
const FORBIDDEN = 'Chỉ quản trị viên cấp cao (SUPER_ADMIN) mới quản lý được khoá AI.';
const MODELS_UNAVAILABLE =
  'Chưa lấy được danh sách model từ nhà cung cấp; model gợi ý vẫn chọn được.';
const INTRO =
  'Trang web dùng một AI để viết luận giải. Dán khoá, giữ model gợi ý hoặc chọn model khác, rồi bấm Dùng cho trang web.';
const CARD_COLUMN = { xs: 24, xl: 8 } as const;
const CARD_GUTTER = 16;

type Busy = Partial<Record<AiProvider, AiProviderAction>>;

export function AiPage() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const [busy, setBusy] = useState<Busy>({});
  const settingsQuery = aiSettingsQuery();
  const { data, isPending, isError, error } = useQuery(settingsQuery);
  const settings = data?.aiSettings;

  const run = async (
    provider: AiProvider,
    action: AiProviderAction,
    failure: string,
    work: () => Promise<void>,
  ): Promise<void> => {
    setBusy((current) => ({ ...current, [provider]: action }));
    try {
      await work();
    } catch (caught) {
      void message.error(rejectionReason(caught) ?? failure);
    } finally {
      await queryClient.invalidateQueries({ queryKey: settingsQuery.queryKey });
      setBusy((current) => ({ ...current, [provider]: undefined }));
    }
  };

  const check = (provider: AiProvider) =>
    run(provider, 'CHECK', `Không kiểm tra được ${AI_PROVIDER_LABEL[provider]}.`, async () => {
      const { checkAiProvider: checked } = await checkAiProvider(provider);
      if (checked.health?.status === 'OK') {
        void message.success(`${AI_PROVIDER_LABEL[provider]} hoạt động.`);
      } else {
        void message.error(`${AI_PROVIDER_LABEL[provider]} không trả lời được.`);
      }
    });

  const save = async (provider: AiProvider, change: AiProviderChange): Promise<void> => {
    let isUsable = false;
    await run(provider, 'SAVE', `Không lưu được ${AI_PROVIDER_LABEL[provider]}.`, async () => {
      const { saveAiProvider: saved } = await saveAiProvider({ provider, ...change });
      isUsable = canBeUsed(saved);
      void message.success(`Đã lưu ${AI_PROVIDER_LABEL[provider]}.`);
    });
    if (isUsable) {
      await check(provider);
    }
  };

  const activate = (provider: AiProvider | null, subject: AiProvider) =>
    run(subject, 'ACTIVATE', 'Không đổi được nhà cung cấp cho trang web.', async () => {
      await setActiveAiProvider(provider);
      void message.success(
        provider
          ? `Trang web chuyển sang ${AI_PROVIDER_LABEL[provider]}.`
          : `Đã ngừng dùng ${AI_PROVIDER_LABEL[subject]}.`,
      );
    });

  const clear = (provider: AiProvider) =>
    run(provider, 'CLEAR', `Không xoá được khoá ${AI_PROVIDER_LABEL[provider]}.`, async () => {
      await clearAiProviderKey(provider);
      void message.success(`Đã xoá khoá ${AI_PROVIDER_LABEL[provider]}.`);
    });

  const checkable = settings?.providers.filter(canBeUsed) ?? [];
  const notice = settings ? sourceNotice(settings) : null;

  return (
    <Flex vertical gap={16}>
      <Flex align="center" justify="space-between" gap={16} wrap>
        <Flex vertical gap={4}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            AI
          </Typography.Title>
          <Typography.Text type="secondary">{INTRO}</Typography.Text>
        </Flex>
        <Button
          disabled={checkable.length === 0}
          onClick={() => void Promise.all(checkable.map(({ provider }) => check(provider)))}
        >
          Kiểm tra tất cả
        </Button>
      </Flex>

      {isError ? (
        <Alert type="error" showIcon title={isForbidden(error) ? FORBIDDEN : LOAD_FAILED} />
      ) : null}
      {isPending ? <Skeleton active /> : null}
      {notice ? (
        <Alert type={notice.type} showIcon title={notice.title} description={notice.description} />
      ) : null}

      <Row gutter={[CARD_GUTTER, CARD_GUTTER]}>
        {settings?.providers.map((provider) => (
          <Col key={`${provider.provider}-${provider.updatedAt ?? 'unsaved'}`} {...CARD_COLUMN}>
            <AiProviderSection
              provider={provider}
              busy={busy[provider.provider] ?? null}
              onSave={(change) => void save(provider.provider, change)}
              onCheck={() => void check(provider.provider)}
              onActivate={() => void activate(provider.provider, provider.provider)}
              onDeactivate={() => void activate(null, provider.provider)}
              onClearKey={() => void clear(provider.provider)}
            />
          </Col>
        ))}
      </Row>

      {settings ? (
        <Typography.Text type="secondary">
          Model gợi ý lấy từ tài liệu chính thức của ba nhà cung cấp ngày {AI_CATALOG_CHECKED_ON}.
          Khi có model mới, gõ thẳng mã model vào ô Model.
        </Typography.Text>
      ) : null}
    </Flex>
  );
}

interface AiProviderSectionProps {
  readonly provider: AiProviderView;
  readonly busy: AiProviderAction | null;
  readonly onSave: (change: AiProviderChange) => void;
  readonly onCheck: () => void;
  readonly onActivate: () => void;
  readonly onDeactivate: () => void;
  readonly onClearKey: () => void;
}

function AiProviderSection({ provider, ...cardProps }: AiProviderSectionProps) {
  const models = useQuery({
    ...aiProviderModelsQuery(provider.provider, provider.apiKeyHint),
    enabled: provider.hasApiKey,
  });

  return (
    <AiProviderCard
      provider={provider}
      liveModels={models.data?.aiProviderModels ?? []}
      liveModelsError={models.isError ? MODELS_UNAVAILABLE : null}
      isLoadingModels={models.isFetching}
      {...cardProps}
    />
  );
}
