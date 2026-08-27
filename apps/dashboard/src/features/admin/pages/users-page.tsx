import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ScrollText, CalendarClock, MoreHorizontal, Ban, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatDate, formatNumber, initials } from '@/lib/utils';
import { PageHeader } from '../components/page-header';
import { PaginationBar } from '../components/pagination-bar';
import { EmptyState } from '../components/empty-state';
import { usePagination } from '../components/use-pagination';
import { adminQueries } from '../data/queries';
import type { AdminUser, GenChartKind, UserStatus } from '../data/types';

const STATUS_META: Record<
  UserStatus,
  { label: string; variant: 'success' | 'neutral' | 'destructive' }
> = {
  active: { label: 'Hoạt động', variant: 'success' },
  inactive: { label: 'Ngưng', variant: 'neutral' },
  banned: { label: 'Bị khóa', variant: 'destructive' },
};

const KIND_LABEL: Record<GenChartKind, string> = {
  'la-so': 'Lá số tử vi',
  'van-han': 'Vận hạn',
  'ngay-tot': 'Xem ngày',
};

export function UsersPage() {
  const { data: users, isLoading } = useQuery(adminQueries.users());
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [banTarget, setBanTarget] = useState<AdminUser | null>(null);

  const filtered = useMemo(() => {
    if (!users) return [];
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => u.displayName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }, [users, query]);

  const pager = usePagination(filtered, 8);

  return (
    <div>
      <PageHeader
        seal="命"
        hanReading="Mệnh Chủ"
        title="Quản lý người dùng"
        subtitle="Thông tin tài khoản, số dư và lịch sử lập lá số."
      />

      <Card className="animate-rise gap-0 overflow-hidden py-0">
        <div className="flex items-center justify-between gap-3 border-b p-4">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm theo tên hoặc email…"
              className="pl-9"
            />
          </div>
          <p className="hidden text-sm text-muted-foreground sm:block">
            {formatNumber(filtered.length)} người dùng
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người dùng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Số dư</TableHead>
              <TableHead className="text-right">Lá số</TableHead>
              <TableHead>Hoạt động gần nhất</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : pager.pageItems.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback>{initials(user.displayName)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{user.displayName}</p>
                          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_META[user.status].variant}>
                        {STATUS_META[user.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="tabular-nums text-right">
                      {formatNumber(user.credits)}
                    </TableCell>
                    <TableCell className="tabular-nums text-right">
                      {formatNumber(user.genCount)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(user.lastActiveAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="outline" size="sm" onClick={() => setSelected(user)}>
                          Chi tiết
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" aria-label="Thao tác">
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelected(user)}>
                              <Eye /> Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setBanTarget(user)}
                            >
                              <Ban /> Khoá tài khoản
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
        {!isLoading && (
          <PaginationBar
            page={pager.page}
            totalPages={pager.totalPages}
            rangeStart={pager.rangeStart}
            rangeEnd={pager.rangeEnd}
            totalItems={pager.totalItems}
            onPage={pager.setPage}
            unit="người dùng"
          />
        )}
      </Card>

      <UserDetailSheet user={selected} onClose={() => setSelected(null)} />

      <ConfirmDialog
        open={!!banTarget}
        onOpenChange={(open) => !open && setBanTarget(null)}
        title="Khoá tài khoản?"
        description={
          <>
            Tài khoản <span className="font-medium text-foreground">{banTarget?.displayName}</span>{' '}
            sẽ bị khoá và không thể đăng nhập. Bạn có chắc chắn?
          </>
        }
        confirmLabel="Khoá tài khoản"
        destructive
        onConfirm={() => setBanTarget(null)}
      />
    </div>
  );
}

function UserDetailSheet({ user, onClose }: { user: AdminUser | null; onClose: () => void }) {
  return (
    <Sheet open={!!user} onOpenChange={(open) => !open && onClose()}>
      <SheetContent>
        {user && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-3">
                <Avatar className="size-11">
                  <AvatarFallback>{initials(user.displayName)}</AvatarFallback>
                </Avatar>
                <div>
                  <SheetTitle>{user.displayName}</SheetTitle>
                  <SheetDescription>{user.email}</SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="grid grid-cols-3 gap-3">
              <Stat label="Số dư" value={formatNumber(user.credits)} />
              <Stat label="Lá số" value={formatNumber(user.genCount)} />
              <Stat label="Tham gia" value={formatDate(user.createdAt)} />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
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
                  <li key={rec.id} className="rounded-lg border bg-card p-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{KIND_LABEL[rec.kind]}</Badge>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarClock className="size-3" />
                        {formatDate(rec.createdAt)}
                      </span>
                    </div>
                    <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                      <Field label="Họ tên" value={rec.input.fullName} />
                      <Field label="Giới tính" value={rec.input.gender === 'nam' ? 'Nam' : 'Nữ'} />
                      <Field label="Ngày sinh" value={formatDate(rec.input.birthDate)} />
                      <Field label="Giờ sinh" value={rec.input.birthHour} />
                      <Field
                        label="Lịch"
                        value={rec.input.calendar === 'duong' ? 'Dương lịch' : 'Âm lịch'}
                      />
                    </dl>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-3 text-center">
      <p className="tabular-nums text-lg font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
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
