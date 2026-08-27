import { useState, type ReactNode } from 'react';
import { BadgeCheck, Mail, ShieldCheck, KeyRound, Moon, LogOut } from 'lucide-react';
import { useAuthStore, selectUser } from '@/stores/auth-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { dayCanChi } from '@/lib/can-chi';
import { initials } from '@/lib/utils';
import { PageHeader } from '../components/page-header';
import { useTheme } from '../layout/use-theme';

export function ProfilePage() {
  const user = useAuthStore(selectUser);
  const canChi = dayCanChi(new Date());

  return (
    <div>
      <PageHeader
        seal="身"
        hanReading="Bản Thân"
        title="Hồ sơ"
        subtitle="Thông tin và bảo mật tài khoản quản trị."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Identity card */}
        <Card className="animate-rise items-center gap-0 py-8 text-center">
          <Avatar className="glow-ring size-24 text-2xl">
            <AvatarFallback className="text-2xl">{initials(user?.displayName)}</AvatarFallback>
          </Avatar>
          <h2 className="mt-4 font-display text-2xl font-semibold text-glow">
            {user?.displayName ?? 'Quản trị viên'}
          </h2>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Mail className="size-3.5" /> {user?.email}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Badge>{user?.role ?? 'ADMIN'}</Badge>
            {user?.isEmailVerified && (
              <Badge variant="success">
                <BadgeCheck /> Đã xác thực
              </Badge>
            )}
          </div>

          <Separator className="my-6" />

          <div className="grid w-full grid-cols-2 gap-3 px-6">
            <div className="rounded-lg border border-border bg-card/40 p-3">
              <p className="font-seal text-lg text-primary">Ngày {canChi}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Can chi hôm nay</p>
            </div>
            <div className="rounded-lg border border-border bg-card/40 p-3">
              <p className="font-seal text-lg text-primary">Hỏa</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Bản mệnh · Bính Ngọ</p>
            </div>
          </div>
        </Card>

        {/* Right column */}
        <div className="grid gap-4 lg:col-span-2">
          <PersonalInfoCard
            displayName={user?.displayName ?? ''}
            email={user?.email ?? ''}
            role={user?.role ?? 'ADMIN'}
          />
          <SecurityCard />
        </div>
      </div>
    </div>
  );
}

function PersonalInfoCard({
  displayName,
  email,
  role,
}: {
  displayName: string;
  email: string;
  role: string;
}) {
  const [saved, setSaved] = useState(false);
  return (
    <Card className="animate-rise" style={{ animationDelay: '90ms' }}>
      <CardHeader>
        <CardTitle className="font-display text-lg">Thông tin cá nhân</CardTitle>
        <CardDescription>Tên hiển thị công khai và liên hệ.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSaved(true);
          }}
        >
          <div className="grid gap-1.5">
            <Label htmlFor="pf-name">Tên hiển thị</Label>
            <Input id="pf-name" defaultValue={displayName} onChange={() => setSaved(false)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="pf-email">Email</Label>
            <Input id="pf-email" type="email" defaultValue={email} disabled />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="pf-role">Vai trò</Label>
            <Input id="pf-role" defaultValue={role} disabled />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="pf-title">Chức danh</Label>
            <Input id="pf-title" defaultValue="Thầy tử vi" onChange={() => setSaved(false)} />
          </div>
          <div className="flex items-center gap-3 sm:col-span-2">
            <Button type="submit">Lưu thay đổi</Button>
            {saved && (
              <span className="flex items-center gap-1 text-sm text-emerald-500">
                <BadgeCheck className="size-4" /> Đã lưu
              </span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function SecurityCard() {
  const { theme } = useTheme();
  return (
    <Card className="animate-rise" style={{ animationDelay: '180ms' }}>
      <CardHeader>
        <CardTitle className="font-display text-lg">Bảo mật</CardTitle>
        <CardDescription>Mật khẩu, xác thực hai lớp và phiên đăng nhập.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Row
          icon={<KeyRound className="size-4 text-primary" />}
          title="Mật khẩu"
          desc="Đổi lần cuối 3 tháng trước"
        >
          <Button variant="outline" size="sm">
            Đổi mật khẩu
          </Button>
        </Row>
        <Separator />
        <Row
          icon={<ShieldCheck className="size-4 text-primary" />}
          title="Xác thực hai lớp (2FA)"
          desc="Bảo vệ tài khoản bằng mã OTP"
        >
          <Switch defaultChecked />
        </Row>
        <Separator />
        <Row
          icon={<Moon className="size-4 text-primary" />}
          title="Giao diện"
          desc="Đổi sáng/tối ở góc phải thanh trên"
        >
          <Badge variant="neutral">{theme === 'dark' ? 'Trời đêm' : 'Ban ngày'}</Badge>
        </Row>
        <Separator />
        <Row
          icon={<LogOut className="size-4 text-destructive" />}
          title="Đăng xuất mọi thiết bị"
          desc="Kết thúc tất cả phiên đang mở"
        >
          <Button variant="outline" size="sm">
            Đăng xuất
          </Button>
        </Row>
      </CardContent>
    </Card>
  );
}

function Row({
  icon,
  title,
  desc,
  children,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-lg bg-primary/10">{icon}</span>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
