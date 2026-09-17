import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ScrollText, CalendarClock, MoreHorizontal, Ban, Eye } from 'lucide-react';
import {
  App,
  Avatar,
  Button,
  Card,
  Col,
  Drawer,
  Dropdown,
  Input,
  Row,
  Statistic,
  Table,
  Tag,
  type MenuProps,
  type TableColumnsType,
} from 'antd';
import { cn, formatDate, formatNumber, initials } from '@/lib/utils';
import { PageHeader } from '../components/page-header';
import { EmptyState } from '../components/empty-state';
import { adminQueries } from '../data/queries';
import { useBanUser } from '../data/mutations';
import type { AdminUser, GenChartKind, UserStatus } from '../data/types';

const STATUS_META: Record<UserStatus, { label: string; color: string }> = {
  active: { label: 'Hoạt động', color: 'green' },
  inactive: { label: 'Ngưng', color: 'default' },
  banned: { label: 'Bị khóa', color: 'red' },
};

const KIND_LABEL: Record<GenChartKind, string> = {
  'la-so': 'Lá số tử vi',
  'van-han': 'Vận hạn',
  'ngay-tot': 'Xem ngày',
};

export function UsersPage() {
  const { data: users, isLoading } = useQuery(adminQueries.users());
  const { modal, message } = App.useApp();
  const banUser = useBanUser();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<AdminUser | null>(null);

  const filtered = useMemo(() => {
    if (!users) return [];
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => u.displayName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }, [users, query]);

  const confirmBan = (user: AdminUser) => {
    modal.confirm({
      title: 'Khoá tài khoản?',
      okText: 'Khoá tài khoản',
      okButtonProps: { danger: true },
      cancelText: 'Huỷ',
      content: (
        <span>
          Tài khoản <span className="font-medium text-foreground">{user.displayName}</span> sẽ bị
          khoá và không thể đăng nhập. Bạn có chắc chắn?
        </span>
      ),
      onOk: async () => {
        try {
          await banUser.mutateAsync(user.id);
          message.success('Đã khoá tài khoản.');
        } catch {
          message.error('Không thể khoá tài khoản.');
        }
      },
    });
  };

  const rowMenu = (user: AdminUser): MenuProps['items'] => [
    {
      key: 'view',
      label: 'Xem chi tiết',
      icon: <Eye className="size-4" />,
      onClick: () => setSelected(user),
    },
    {
      key: 'ban',
      label: 'Khoá tài khoản',
      icon: <Ban className="size-4" />,
      danger: true,
      onClick: () => confirmBan(user),
    },
  ];

  const columns: TableColumnsType<AdminUser> = [
    {
      title: 'Người dùng',
      dataIndex: 'displayName',
      render: (_, user) => (
        <div className="flex items-center gap-3">
          <Avatar size={32} style={{ background: 'var(--primary)' }}>
            {initials(user.displayName)}
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{user.displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status: UserStatus) => (
        <Tag color={STATUS_META[status].color}>{STATUS_META[status].label}</Tag>
      ),
    },
    {
      title: 'Số dư',
      dataIndex: 'credits',
      align: 'right',
      render: (credits: number) => <span className="tabular-nums">{formatNumber(credits)}</span>,
    },
    {
      title: 'Lá số',
      dataIndex: 'genCount',
      align: 'right',
      render: (genCount: number) => <span className="tabular-nums">{formatNumber(genCount)}</span>,
    },
    {
      title: 'Hoạt động gần nhất',
      dataIndex: 'lastActiveAt',
      render: (lastActiveAt: string) => (
        <span className="text-sm text-muted-foreground">{formatDate(lastActiveAt)}</span>
      ),
    },
    {
      title: '',
      key: 'actions',
      align: 'right',
      render: (_, user) => (
        <div className="flex items-center justify-end gap-1">
          <Button size="small" onClick={() => setSelected(user)}>
            Chi tiết
          </Button>
          <Dropdown menu={{ items: rowMenu(user) }} trigger={['click']} placement="bottomRight">
            <Button
              type="text"
              size="small"
              aria-label="Thao tác"
              icon={<MoreHorizontal className="size-4" />}
            />
          </Dropdown>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        seal="命"
        hanReading="Mệnh Chủ"
        title="Quản lý người dùng"
        subtitle="Thông tin tài khoản, số dư và lịch sử lập lá số."
      />

      <Card
        variant="borderless"
        className="animate-rise"
        styles={{ body: { padding: 0 } }}
        title={
          <div className="flex items-center justify-between gap-3">
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm theo tên hoặc email…"
                className="pl-9"
                variant="borderless"
              />
            </div>
            <p className="hidden text-sm font-normal text-muted-foreground sm:block">
              {formatNumber(filtered.length)} người dùng
            </p>
          </div>
        }
      >
        <Table<AdminUser>
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          loading={isLoading}
          pagination={{ pageSize: 8, hideOnSinglePage: true }}
        />
      </Card>

      <UserDetailDrawer user={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function UserDetailDrawer({ user, onClose }: { user: AdminUser | null; onClose: () => void }) {
  return (
    <Drawer
      open={!!user}
      onClose={onClose}
      size={420}
      title={
        user && (
          <div className="flex items-center gap-3">
            <Avatar size={44} style={{ background: 'var(--primary)' }}>
              {initials(user.displayName)}
            </Avatar>
            <div>
              <p className="text-lg font-semibold text-foreground">{user.displayName}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        )
      }
    >
      {user && (
        <>
          <Row gutter={12}>
            <Col span={8}>
              <Stat label="Số dư" value={formatNumber(user.credits)} />
            </Col>
            <Col span={8}>
              <Stat label="Lá số" value={formatNumber(user.genCount)} />
            </Col>
            <Col span={8}>
              <Stat label="Tham gia" value={formatDate(user.createdAt)} />
            </Col>
          </Row>

          <div className="mt-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-medium">
              <ScrollText className="size-4 text-primary" />
              Lịch sử lập lá số
            </p>
            <ul className="space-y-2">
              {user.genHistory.length === 0 && (
                <li>
                  <EmptyState title="Chưa lập lá số nào">
                    Người dùng này chưa tạo bản luận giải.
                  </EmptyState>
                </li>
              )}
              {user.genHistory.map((rec) => (
                <li key={rec.id}>
                  <Card
                    variant="borderless"
                    size="small"
                    title={<Tag bordered>{KIND_LABEL[rec.kind]}</Tag>}
                    extra={
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarClock className="size-3" />
                        {formatDate(rec.createdAt)}
                      </span>
                    }
                  >
                    <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                      <Field label="Họ tên" value={rec.input.fullName} />
                      <Field label="Giới tính" value={rec.input.gender === 'nam' ? 'Nam' : 'Nữ'} />
                      <Field label="Ngày sinh" value={formatDate(rec.input.birthDate)} />
                      <Field label="Giờ sinh" value={rec.input.birthHour} />
                      <Field
                        label="Lịch"
                        value={rec.input.calendar === 'duong' ? 'Dương lịch' : 'Âm lịch'}
                      />
                    </dl>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </Drawer>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card variant="borderless" size="small" className="text-center">
      <Statistic title={label} value={value} valueStyle={{ fontSize: 18, fontWeight: 600 }} />
    </Card>
  );
}

function Field({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn('min-w-0', className)}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate font-medium">{value}</dd>
    </div>
  );
}
