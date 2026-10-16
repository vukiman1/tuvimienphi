import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, Flex, Input, InputNumber, Modal, Typography } from 'antd';
import { formatNumber } from '@org/frontend-shared';
import { errorMessage } from '@/lib/api-error';
import { rejectionReason } from '@/lib/graphql-request';
import {
  PAYMENTS_QUERY_KEY,
  assignPayment,
  type AdminPaymentRow,
} from '../data/admin-payments.query';

interface AssignPaymentDialogProps {
  readonly payment: AdminPaymentRow | null;
  readonly onClose: () => void;
}

const MIN_CREDITS = 1;
const MAX_CREDITS = 1000;
const ASSIGN_FAILED = 'Không cộng được lượt.';

export function AssignPaymentDialog({ payment, onClose }: AssignPaymentDialogProps) {
  const queryClient = useQueryClient();
  const [userEmail, setUserEmail] = useState('');
  const [editedCredits, setEditedCredits] = useState<number | null>(null);

  const credits = editedCredits ?? Math.max(MIN_CREDITS, payment?.suggestedCredits ?? 0);

  const assignment = useMutation({
    mutationFn: (paymentId: string) =>
      assignPayment({ paymentId, userEmail: userEmail.trim(), credits }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEY });
      onClose();
    },
  });

  const canSave = userEmail.trim() !== '' && credits >= MIN_CREDITS;

  return (
    <Modal
      open={payment !== null}
      title="Cộng cho người dùng"
      okText="Cộng lượt"
      cancelText="Huỷ"
      okButtonProps={{ disabled: !canSave }}
      confirmLoading={assignment.isPending}
      onOk={() => payment && assignment.mutate(payment.id)}
      onCancel={onClose}
      afterClose={() => {
        setUserEmail('');
        setEditedCredits(null);
        assignment.reset();
      }}
      destroyOnHidden
    >
      <Flex vertical gap={12}>
        <Typography.Text type="secondary">
          Giao dịch {formatNumber(payment?.amountVnd ?? 0)}đ: {payment?.content}
        </Typography.Text>
        <Input
          type="email"
          placeholder="Email người dùng"
          value={userEmail}
          onChange={(event) => setUserEmail(event.target.value)}
        />
        <InputNumber<number>
          value={credits}
          min={MIN_CREDITS}
          max={MAX_CREDITS}
          precision={0}
          style={{ width: '100%' }}
          onChange={(value) => setEditedCredits(value ?? MIN_CREDITS)}
        />
        {assignment.isError ? (
          <Alert
            type="error"
            showIcon
            title={
              rejectionReason(assignment.error) ?? errorMessage(assignment.error, ASSIGN_FAILED)
            }
          />
        ) : null}
      </Flex>
    </Modal>
  );
}
