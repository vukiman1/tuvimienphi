import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, Flex, InputNumber, Modal, Typography } from 'antd';
import { formatNumber } from '@org/frontend-shared';
import { errorMessage } from '@/lib/api-error';
import { rejectionReason } from '@/lib/graphql-request';
import {
  USERS_QUERY_KEY,
  adjustChapterCredits,
  type AdminUserRow,
} from '../data/admin-users.query';

interface AdjustCreditsDialogProps {
  readonly user: AdminUserRow | null;
  readonly onClose: () => void;
}

const INITIAL_DELTA = 0;
const ADJUST_FAILED = 'Không chỉnh được lượt.';

export function AdjustCreditsDialog({ user, onClose }: AdjustCreditsDialogProps) {
  const queryClient = useQueryClient();
  const [delta, setDelta] = useState<number>(INITIAL_DELTA);

  const adjustment = useMutation({
    mutationFn: (userId: string) => adjustChapterCredits({ userId, delta }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      onClose();
    },
  });

  const currentCredits = user?.chapterCredits ?? 0;
  const resultingCredits = currentCredits + delta;
  const canSave = delta !== INITIAL_DELTA && resultingCredits >= 0;

  return (
    <Modal
      open={user !== null}
      title="Chỉnh lượt"
      okText="Lưu"
      cancelText="Huỷ"
      okButtonProps={{ disabled: !canSave }}
      confirmLoading={adjustment.isPending}
      onOk={() => user && adjustment.mutate(user.id)}
      onCancel={onClose}
      afterClose={() => {
        setDelta(INITIAL_DELTA);
        adjustment.reset();
      }}
      destroyOnHidden
    >
      <Flex vertical gap={12}>
        <Typography.Text type="secondary">
          {user?.displayName ?? user?.email} đang có {formatNumber(currentCredits)} lượt. Nhập số âm
          để trừ.
        </Typography.Text>
        <InputNumber<number>
          value={delta}
          precision={0}
          style={{ width: '100%' }}
          onChange={(value) => setDelta(value ?? INITIAL_DELTA)}
        />
        <Typography.Text>Sau khi chỉnh: {formatNumber(resultingCredits)} lượt</Typography.Text>
        {adjustment.isError ? (
          <Alert
            type="error"
            showIcon
            title={
              rejectionReason(adjustment.error) ?? errorMessage(adjustment.error, ADJUST_FAILED)
            }
          />
        ) : null}
      </Flex>
    </Modal>
  );
}
