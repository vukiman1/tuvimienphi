import { useState, type ReactNode } from 'react';
import { BadgeCheck, Mail, ShieldCheck, KeyRound, Moon, LogOut } from 'lucide-react';
import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  Row,
  Switch,
  Tag,
} from 'antd';
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

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card variant="borderless" className="animate-rise text-center">
            <div className="flex flex-col items-center">
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
            </div>

            <Divider className="my-6" />

            <Row gutter={12}>
              <Col span={12}>
                <Card variant="borderless" size="small">
                  <p className="font-seal text-lg text-primary">Ngày {canChi}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">Can chi hôm nay</p>
                </Card>
              </Col>
              <Col span={12}>
                <Card variant="borderless" size="small">
                  <p className="font-seal text-lg text-primary">Hỏa</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">Bản mệnh · Bính Ngọ</p>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <div className="grid gap-4">
            <PersonalInfoCard
              displayName={user?.displayName ?? ''}
              email={user?.email ?? ''}
              role={user?.role ?? 'ADMIN'}
            />
            <SecurityCard />
          </div>
        </Col>
      </Row>
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
    <Card
      variant="borderless"
      className="animate-rise"
      style={{ animationDelay: '90ms' }}
      title="Thông tin cá nhân"
    >
      <p className="text-sm text-muted-foreground">Tên hiển thị công khai và liên hệ.</p>

      <Descriptions
        bordered
        size="small"
        className="mt-4"
        column={{ xs: 1, sm: 2 }}
        items={[
          { key: 'displayName', label: 'Tên hiển thị', children: displayName || '—' },
          { key: 'email', label: 'Email', children: email || '—' },
          { key: 'role', label: 'Vai trò', children: <Tag color="gold">{role}</Tag> },
          { key: 'title', label: 'Chức danh', children: 'Thầy tử vi' },
        ]}
      />

      <Divider className="my-6" />

      <Form<PersonalInfoValues>
        layout="vertical"
        requiredMark={false}
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
    </Card>
  );
}

function SecurityCard() {
  const { theme } = useTheme();
  return (
    <Card
      variant="borderless"
      className="animate-rise"
      style={{ animationDelay: '180ms' }}
      title="Bảo mật"
    >
      <p className="text-sm text-muted-foreground">
        Mật khẩu, xác thực hai lớp và phiên đăng nhập.
      </p>

      <div className="mt-4 space-y-4">
        <SettingRow
          icon={<KeyRound className="size-4 text-primary" />}
          title="Mật khẩu"
          desc="Đổi lần cuối 3 tháng trước"
        >
          <Button size="small">Đổi mật khẩu</Button>
        </SettingRow>
        <Divider className="my-0" />
        <SettingRow
          icon={<ShieldCheck className="size-4 text-primary" />}
          title="Xác thực hai lớp (2FA)"
          desc="Bảo vệ tài khoản bằng mã OTP"
        >
          <Switch defaultChecked />
        </SettingRow>
        <Divider className="my-0" />
        <SettingRow
          icon={<Moon className="size-4 text-primary" />}
          title="Giao diện"
          desc="Đổi sáng/tối ở góc phải thanh trên"
        >
          <Tag>{theme === 'dark' ? 'Trời đêm' : 'Ban ngày'}</Tag>
        </SettingRow>
        <Divider className="my-0" />
        <SettingRow
          icon={<LogOut className="size-4 text-destructive" />}
          title="Đăng xuất mọi thiết bị"
          desc="Kết thúc tất cả phiên đang mở"
        >
          <Button size="small">Đăng xuất</Button>
        </SettingRow>
      </div>
    </Card>
  );
}

function SettingRow({
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
