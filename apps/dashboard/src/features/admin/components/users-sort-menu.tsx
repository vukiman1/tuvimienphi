import { Button, Dropdown, Tooltip } from 'antd';
import { SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import type { AdminUserSortField, SortDirection } from '@/gql/graphql';
import type { AdminUsersFilters } from '../data/admin-users.query';

interface SortOption {
  readonly field: AdminUserSortField;
  readonly direction: SortDirection;
  readonly label: string;
}

const SORT_OPTIONS = [
  { field: 'CREATED_AT', direction: 'DESC', label: 'Mới tham gia trước' },
  { field: 'CREATED_AT', direction: 'ASC', label: 'Tham gia lâu nhất trước' },
  { field: 'BALANCE', direction: 'DESC', label: 'Số dư cao nhất trước' },
  { field: 'BALANCE', direction: 'ASC', label: 'Số dư thấp nhất trước' },
  { field: 'EMAIL', direction: 'ASC', label: 'Email A → Z' },
  { field: 'EMAIL', direction: 'DESC', label: 'Email Z → A' },
] as const satisfies readonly SortOption[];

interface UsersSortMenuProps {
  readonly filters: AdminUsersFilters;
  readonly onChange: (patch: Partial<AdminUsersFilters>) => void;
}

export function UsersSortMenu({ filters, onChange }: UsersSortMenuProps) {
  const activeKey = optionKey(filters.sortBy, filters.sortDirection);
  const activeLabel = SORT_OPTIONS.find(
    (option) => optionKey(option.field, option.direction) === activeKey,
  )?.label;
  const Icon = filters.sortDirection === 'ASC' ? SortAscendingOutlined : SortDescendingOutlined;

  return (
    <Dropdown
      trigger={['click']}
      menu={{
        selectable: true,
        selectedKeys: [activeKey],
        items: SORT_OPTIONS.map((option) => ({
          key: optionKey(option.field, option.direction),
          label: option.label,
        })),
        onClick: ({ key }) => {
          const chosen = SORT_OPTIONS.find(
            (option) => optionKey(option.field, option.direction) === key,
          );
          if (chosen) {
            onChange({ sortBy: chosen.field, sortDirection: chosen.direction });
          }
        },
      }}
    >
      <Tooltip title={`Sắp xếp: ${activeLabel}`}>
        <Button type="text" aria-label={`Sắp xếp: ${activeLabel}`} icon={<Icon />} />
      </Tooltip>
    </Dropdown>
  );
}

function optionKey(field: AdminUserSortField, direction: SortDirection): string {
  return `${field}:${direction}`;
}
