import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, Flex, InputNumber, Typography } from 'antd';
import { MAX_DAILY_CHAPTER_QUOTA } from '@org/shared-contracts';
import { errorMessage } from '@/lib/api-error';
import { rejectionReason } from '@/lib/graphql-request';
import {
  CREDIT_SETTINGS_QUERY_KEY,
  updateCreditSettings,
} from '../data/admin-credit-settings.query';
import { USERS_QUERY_KEY } from '../data/admin-users.query';

interface DailyQuotaSettingProps {
  readonly dailyChapterQuota: number;
}

const MIN_DAILY_CHAPTER_QUOTA = 0;
const SAVE_FAILED = 'Không lưu được lượt miễn phí mỗi ngày.';

export function DailyQuotaSetting({ dailyChapterQuota }: DailyQuotaSettingProps) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<number | null>(null);
  const value = draft ?? dailyChapterQuota;

  const saving = useMutation({
    mutationFn: (nextQuota: number) => updateCreditSettings({ dailyChapterQuota: nextQuota }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: CREDIT_SETTINGS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY }),
      ]);
      setDraft(null);
    },
  });

  const canSave = value !== dailyChapterQuota;

  return (
    <Card size="small">
      <Flex vertical gap={8}>
        <Flex align="center" gap={12} wrap>
          <Typography.Text strong>Lượt miễn phí mỗi ngày</Typography.Text>
          <InputNumber<number>
            aria-label="Lượt miễn phí mỗi ngày"
            value={value}
            min={MIN_DAILY_CHAPTER_QUOTA}
            max={MAX_DAILY_CHAPTER_QUOTA}
            precision={0}
            onChange={(next) => setDraft(next ?? dailyChapterQuota)}
          />
          <Button
            type="primary"
            disabled={!canSave}
            loading={saving.isPending}
            onClick={() => saving.mutate(value)}
          >
            Lưu
          </Button>
        </Flex>
        <Typography.Text type="secondary">
          Áp dụng ngay cho mọi người. Đặt 0 để tắt lượt miễn phí; lượt mua vẫn dùng được.
        </Typography.Text>
        {saving.isError ? (
          <Alert
            type="error"
            showIcon
            title={rejectionReason(saving.error) ?? errorMessage(saving.error, SAVE_FAILED)}
          />
        ) : null}
      </Flex>
    </Card>
  );
}
