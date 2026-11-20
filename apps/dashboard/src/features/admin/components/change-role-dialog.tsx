import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, App, Flex, Modal, Radio, Tag, Typography } from 'antd';
import type { AdminUsersQuery } from '@/gql/graphql';
import { errorMessage } from '@/lib/api-error';
import { rejectionReason } from '@/lib/graphql-request';
import {
  USERS_QUERY_KEY,
  replaceUserRow,
  setUserRole,
  type AdminUserRow,
} from '../data/admin-users.query';
import {
  ASSIGNABLE_ROLES,
  ASSIGNABLE_ROLE_LABEL,
  isAssignableRole,
  type AssignableRole,
} from './role-change-policy';
import { ROLE_LABEL } from './role-label';

interface ChangeRoleDialogProps {
  readonly user: AdminUserRow | null;
  readonly onClose: () => void;
}

enum ChangeRoleStep {
  Choose = 'choose',
  Confirm = 'confirm',
}

const DEFAULT_CHOICE: AssignableRole = 'USER';
const CHANGE_FAILED = 'Không đổi được quyền.';
const SIGN_OUT_NOTICE = 'Người này sẽ bị đăng xuất khỏi mọi thiết bị và cần đăng nhập lại.';

function confirmQuestion(role: AssignableRole, email: string): string {
  return role === 'ADMIN'
    ? `Cấp quyền quản trị cho ${email}?`
    : `Thu hồi quyền quản trị của ${email}?`;
}

function successNotice(role: AssignableRole, email: string): string {
  return role === 'ADMIN'
    ? `Đã cấp quyền quản trị cho ${email}.`
    : `Đã thu hồi quyền quản trị của ${email}.`;
}

export function ChangeRoleDialog({ user, onClose }: ChangeRoleDialogProps) {
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const [step, setStep] = useState<ChangeRoleStep>(ChangeRoleStep.Choose);
  const [picked, setPicked] = useState<AssignableRole | null>(null);

  const currentRole = user?.role ?? DEFAULT_CHOICE;
  const chosen = picked ?? (isAssignableRole(currentRole) ? currentRole : DEFAULT_CHOICE);
  const email = user?.email ?? '';

  const change = useMutation({
    mutationFn: (userId: string) => setUserRole({ userId, role: chosen }),
    onSuccess: (row) => {
      queryClient.setQueriesData<AdminUsersQuery>({ queryKey: USERS_QUERY_KEY }, (page) =>
        replaceUserRow(page, row),
      );
      void message.success(successNotice(chosen, row.email));
      onClose();
    },
  });

  const isConfirming = step === ChangeRoleStep.Confirm;

  const proceed = (): void => {
    if (!user) return;
    if (!isConfirming) {
      setStep(ChangeRoleStep.Confirm);
      return;
    }
    change.mutate(user.id);
  };

  return (
    <Modal
      open={user !== null}
      title="Quyền"
      okText={isConfirming ? 'Xác nhận' : 'Tiếp tục'}
      cancelText="Huỷ"
      okButtonProps={{ disabled: chosen === currentRole, danger: isConfirming }}
      confirmLoading={change.isPending}
      onOk={proceed}
      onCancel={onClose}
      afterClose={() => {
        setStep(ChangeRoleStep.Choose);
        setPicked(null);
        change.reset();
      }}
      destroyOnHidden
    >
      <Flex vertical gap={12}>
        <Typography.Text type="secondary">
          Quyền hiện tại của {email}: <Tag>{ROLE_LABEL[currentRole]}</Tag>
        </Typography.Text>
        {isConfirming ? (
          <Flex vertical gap={4}>
            <Typography.Text strong>{confirmQuestion(chosen, email)}</Typography.Text>
            <Typography.Text type="secondary">{SIGN_OUT_NOTICE}</Typography.Text>
          </Flex>
        ) : (
          <Radio.Group value={chosen}>
            {ASSIGNABLE_ROLES.map((role) => (
              <Radio key={role} value={role} onChange={() => setPicked(role)}>
                {ASSIGNABLE_ROLE_LABEL[role]}
              </Radio>
            ))}
          </Radio.Group>
        )}
        {change.isError ? (
          <Alert
            type="error"
            showIcon
            title={rejectionReason(change.error) ?? errorMessage(change.error, CHANGE_FAILED)}
          />
        ) : null}
      </Flex>
    </Modal>
  );
}
