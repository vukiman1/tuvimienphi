import { useState } from 'react';
import { Button, DatePicker, Flex, InputNumber, Popover, Space, Tooltip } from 'antd';
import { CalendarOutlined, ClearOutlined, WalletOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import { USERS_SEARCH_MAX_LENGTH, type AdminUsersFilters } from '../data/admin-users.query';
import { ExpandingSearch } from './expanding-search';
import { UsersSortMenu } from './users-sort-menu';

const ISO_DATE_FORMAT = 'YYYY-MM-DD';
const DISPLAY_DATE_FORMAT = 'DD/MM/YYYY';
const BALANCE_WIDTH = 120;

interface BalanceDraft {
  readonly min: number | null;
  readonly max: number | null;
}

interface UsersToolbarProps {
  readonly filters: AdminUsersFilters;
  readonly onChange: (patch: Partial<AdminUsersFilters>) => void;
  readonly onReset: () => void;
}

export function UsersToolbar({ filters, onChange, onReset }: UsersToolbarProps) {
  const [isBalanceOpen, setIsBalanceOpen] = useState(false);
  const [balance, setBalance] = useState<BalanceDraft>({
    min: filters.balanceMin,
    max: filters.balanceMax,
  });

  const applyBalance = () => {
    onChange({ balanceMin: balance.min, balanceMax: balance.max });
    setIsBalanceOpen(false);
  };

  const openBalance = (open: boolean) => {
    if (open) {
      setBalance({ min: filters.balanceMin, max: filters.balanceMax });
    }
    setIsBalanceOpen(open);
  };

  return (
    <Flex align="center" gap={4}>
      <ExpandingSearch
        value={filters.search}
        label="Tìm người dùng"
        placeholder="Email hoặc tên"
        maxLength={USERS_SEARCH_MAX_LENGTH}
        onSearch={(search) => onChange({ search })}
      />

      <Popover
        trigger="click"
        placement="bottomRight"
        content={
          <DatePicker.RangePicker
            allowEmpty={[true, true]}
            placeholder={['Từ ngày', 'Đến ngày']}
            format={DISPLAY_DATE_FORMAT}
            value={joinedRange(filters)}
            onChange={(dates) =>
              onChange({
                joinedFrom: dates?.[0]?.format(ISO_DATE_FORMAT) ?? null,
                joinedTo: dates?.[1]?.format(ISO_DATE_FORMAT) ?? null,
              })
            }
          />
        }
      >
        <Tooltip title="Lọc theo ngày tham gia">
          <Button type="text" aria-label="Lọc theo ngày tham gia" icon={<CalendarOutlined />} />
        </Tooltip>
      </Popover>

      <Popover
        trigger="click"
        placement="bottomRight"
        open={isBalanceOpen}
        onOpenChange={openBalance}
        content={
          <Flex vertical gap={8}>
            <Space.Compact>
              <InputNumber
                min={0}
                placeholder="Từ"
                value={balance.min}
                onChange={(min) => setBalance({ ...balance, min })}
                onPressEnter={applyBalance}
                style={{ width: BALANCE_WIDTH }}
              />
              <InputNumber
                min={0}
                placeholder="Đến"
                value={balance.max}
                onChange={(max) => setBalance({ ...balance, max })}
                onPressEnter={applyBalance}
                style={{ width: BALANCE_WIDTH }}
              />
            </Space.Compact>
            <Button type="primary" onClick={applyBalance}>
              Áp dụng
            </Button>
          </Flex>
        }
      >
        <Tooltip title="Lọc theo số dư">
          <Button type="text" aria-label="Lọc theo số dư" icon={<WalletOutlined />} />
        </Tooltip>
      </Popover>

      <UsersSortMenu filters={filters} onChange={onChange} />

      {hasActiveFilters(filters) ? (
        <Tooltip title="Xoá tất cả bộ lọc">
          <Button
            type="text"
            aria-label="Xoá tất cả bộ lọc"
            icon={<ClearOutlined />}
            onClick={onReset}
          />
        </Tooltip>
      ) : null}
    </Flex>
  );
}

function joinedRange(filters: AdminUsersFilters): [Dayjs | null, Dayjs | null] | null {
  if (!filters.joinedFrom && !filters.joinedTo) {
    return null;
  }
  return [
    filters.joinedFrom ? dayjs(filters.joinedFrom) : null,
    filters.joinedTo ? dayjs(filters.joinedTo) : null,
  ];
}

function hasActiveFilters(filters: AdminUsersFilters): boolean {
  return (
    filters.search !== '' ||
    filters.roles.length > 0 ||
    filters.isEmailVerified !== null ||
    filters.joinedFrom !== null ||
    filters.joinedTo !== null ||
    filters.balanceMin !== null ||
    filters.balanceMax !== null
  );
}
