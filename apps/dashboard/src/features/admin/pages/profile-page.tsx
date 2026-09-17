import { useState, type ReactNode } from 'react';
import { BadgeCheck, Mail, ShieldCheck, KeyRound, Moon, LogOut } from 'lucide-react';
import { Avatar, Button, Divider, Form, Input, Switch, Tag } from 'antd';
import { useAuthStore, selectUser } from '@/stores/auth-store';
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
        <div className="glass animate-rise flex flex-col items-center rounded-xl py-8 text-center">
          <Avatar
            size={96}
            className="glow-ring"
            style={{ background: 'var(--primary)', fontSize: 24 }}
          >
            {initials(user?.displayName)}
          </Avatar>
          <h2 className="mt-4 font-display text-2xl font-semibold text-glow">
            {user?.displayName ?? 'Quản trị viên'}
          </h2>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Mail className="size-3.5" /> {user?.email}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Tag color="gold">{user?.role ?? 'ADMIN'}</Tag>
            {user?.isEmailVerified && (
              <Tag color="green" icon={<BadgeCheck className="size-3" />}>
                Đã xác thực
              </Tag>
            )}
          </div>

          <Divider className="my-6" />

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
        </div>

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

interface PersonalInfoValues {
  displayName: string;
  email: string;
  role: string;
  title: string;
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

  const onFinish = () => setSaved(true);

  return (
    <div className="glass animate-rise rounded-xl p-6" style={{ animationDelay: '90ms' }}>
      <h3 className="font-display text-lg font-semibold">Thông tin cá nhân</h3>
      <p className="mt-1 text-sm text-muted-foreground">Tên hiển thị công khai và liên hệ.</p>

      <Form<PersonalInfoValues>
        layout="vertical"
        requiredMark={false}
        className="mt-4"
        initialValues={{ displayName, email, role, title: 'Thầy tử vi' }}
        onValuesChange={() => setSaved(false)}
        onFinish={onFinish}
      >
        <div className="grid gap-x-4 sm:grid-cols-2">
          <Form.Item name="displayName" label="Tên hiển thị">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input type="email" disabled />
          </Form.Item>
          <Form.Item name="role" label="Vai trò">
            <Input disabled />
          </Form.Item>
          <Form.Item name="title" label="Chức danh">
            <Input />
          </Form.Item>
        </div>
        <div className="flex items-center gap-3">
          <Button type="primary" htmlType="submit">
            Lưu thay đổi
          </Button>
          {saved && (
            <span className="flex items-center gap-1 text-sm text-emerald-500">
              <BadgeCheck className="size-4" /> Đã lưu
            </span>
          )}
        </div>
      </Form>
    </div>
  );
}

function SecurityCard() {
  const { theme } = useTheme();
  return (
    <div className="glass animate-rise rounded-xl p-6" style={{ animationDelay: '180ms' }}>
      <h3 className="font-display text-lg font-semibold">Bảo mật</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Mật khẩu, xác thực hai lớp và phiên đăng nhập.
      </p>

      <div className="mt-4 space-y-4">
        <Row
          icon={<KeyRound className="size-4 text-primary" />}
          title="Mật khẩu"
          desc="Đổi lần cuối 3 tháng trước"
        >
          <Button size="small">Đổi mật khẩu</Button>
        </Row>
        <Divider className="my-0" />
        <Row
          icon={<ShieldCheck className="size-4 text-primary" />}
          title="Xác thực hai lớp (2FA)"
          desc="Bảo vệ tài khoản bằng mã OTP"
        >
          <Switch defaultChecked />
        </Row>
        <Divider className="my-0" />
        <Row
          icon={<Moon className="size-4 text-primary" />}
          title="Giao diện"
          desc="Đổi sáng/tối ở góc phải thanh trên"
        >
          <Tag>{theme === 'dark' ? 'Trời đêm' : 'Ban ngày'}</Tag>
        </Row>
        <Divider className="my-0" />
        <Row
          icon={<LogOut className="size-4 text-destructive" />}
          title="Đăng xuất mọi thiết bị"
          desc="Kết thúc tất cả phiên đang mở"
        >
          <Button size="small">Đăng xuất</Button>
        </Row>
      </div>
    </div>
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
