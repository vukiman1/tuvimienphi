import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Flex, Table, Typography } from 'antd';
import { errorMessage } from '@/lib/api-error';
import { rejectionReason } from '@/lib/graphql-request';
import { GiftCodeForm } from '../components/gift-code-form';
import { buildGiftCodesColumns } from '../components/gift-codes-table-columns';
import {
  GIFT_CODES_QUERY_KEY,
  adminGiftCodesQuery,
  setGiftCodeActive,
  type AdminGiftCodeRow,
} from '../data/admin-gift-codes.query';

const LOAD_FAILED = 'Không tải được danh sách giftcode.';
const TOGGLE_FAILED = 'Không đổi được trạng thái giftcode.';

interface ToggleVariables {
  readonly id: string;
  readonly isActive: boolean;
}

export function GiftCodesPage() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const { data, isFetching, isError, error } = useQuery(adminGiftCodesQuery());

  const toggle = useMutation({
    mutationFn: ({ id, isActive }: ToggleVariables) => setGiftCodeActive(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GIFT_CODES_QUERY_KEY }),
  });

  const pendingId = toggle.isPending ? toggle.variables.id : null;

  return (
    <Flex vertical gap={16}>
      <Flex justify="space-between" align="center">
        <Typography.Title level={3} style={{ margin: 0 }}>
          Giftcode
        </Typography.Title>
        <Button type="primary" onClick={() => setIsCreating(true)}>
          Tạo giftcode
        </Button>
      </Flex>

      {isError ? <Alert type="error" showIcon title={errorMessage(error, LOAD_FAILED)} /> : null}
      {toggle.isError ? (
        <Alert
          type="error"
          showIcon
          title={rejectionReason(toggle.error) ?? errorMessage(toggle.error, TOGGLE_FAILED)}
        />
      ) : null}

      <Table<AdminGiftCodeRow>
        rowKey="id"
        columns={buildGiftCodesColumns(
          (giftCode, isActive) => toggle.mutate({ id: giftCode.id, isActive }),
          pendingId,
        )}
        dataSource={data?.giftCodes}
        loading={isFetching}
        scroll={{ x: 'max-content' }}
        pagination={false}
      />

      <GiftCodeForm open={isCreating} onClose={() => setIsCreating(false)} />
    </Flex>
  );
}
