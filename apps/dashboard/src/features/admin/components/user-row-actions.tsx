import { Button, Flex, Tooltip } from 'antd';
import { selectUser, useAuthStore } from '@/stores/auth-store';
import type { AdminUserRow } from '../data/admin-users.query';
import { roleChangeAvailability } from './role-change-policy';

export interface UserRowActionHandlers {
  readonly onAdjustCredits: (user: AdminUserRow) => void;
  readonly onChangeRole: (user: AdminUserRow) => void;
}

interface UserRowActionsProps extends UserRowActionHandlers {
  readonly user: AdminUserRow;
}

export function UserRowActions({ user, onAdjustCredits, onChangeRole }: UserRowActionsProps) {
  const viewer = useAuthStore(selectUser);
  const roleChange = roleChangeAvailability(user, viewer);

  return (
    <Flex>
      <Button type="link" onClick={() => onAdjustCredits(user)}>
        Chỉnh lượt
      </Button>
      {roleChange.kind === 'allowed' ? (
        <Button type="link" onClick={() => onChangeRole(user)}>
          Quyền
        </Button>
      ) : null}
      {roleChange.kind === 'blocked' ? (
        <Tooltip title={roleChange.reason}>
          <Button type="link" disabled aria-description={roleChange.reason}>
            Quyền
          </Button>
        </Tooltip>
      ) : null}
    </Flex>
  );
}
