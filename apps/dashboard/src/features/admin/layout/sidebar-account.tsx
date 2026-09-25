import { useNavigate } from '@tanstack/react-router';
import { BellOutlined, LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Divider, Dropdown, Flex, Typography, theme } from 'antd';
import { env } from '@/config/env';
import { resetAuthBootstrap } from '@/features/auth/bootstrap';
import { LOGIN_PATH } from '@/features/auth/route-guards';
import { authService } from '@/services/auth-service';
import { selectUser, useAuthStore } from '@/stores/auth-store';

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: 'Quản trị viên',
  ADMIN: 'Quản trị viên',
  SELLER: 'Người bán',
  USER: 'Người dùng',
};

const ACTION_BUTTON_STYLE = { justifyContent: 'flex-start', paddingInline: 8 } as const;

enum UserMenuKey {
  Profile = 'profile',
  SignOut = 'sign-out',
}

export function SidebarAccount() {
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const user = useAuthStore(selectUser);
  const setUser = useAuthStore((state) => state.setUser);

  const signOut = async () => {
    try {
      await authService.logout();
    } finally {
      resetAuthBootstrap();
      setUser(null);
      await navigate({ to: LOGIN_PATH });
    }
  };

  return (
    <Flex
      vertical
      gap={2}
      style={{
        position: 'relative',
        padding: 8,
        background: token.colorBgContainer,
        borderTop: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <Dropdown
        trigger={['click']}
        placement="topLeft"
        menu={{
          items: [
            { key: UserMenuKey.Profile, icon: <UserOutlined />, label: 'Hồ sơ' },
            { type: 'divider' },
            {
              key: UserMenuKey.SignOut,
              icon: <LogoutOutlined />,
              label: 'Đăng xuất',
              danger: true,
            },
          ],
          onClick: ({ key }) => {
            if (key === UserMenuKey.Profile) {
              void navigate({ to: '/profile' });
            }
            if (key === UserMenuKey.SignOut) {
              void signOut();
            }
          },
        }}
      >
        <Flex
          align="center"
          gap={10}
          role="button"
          tabIndex={0}
          style={{
            cursor: 'pointer',
            padding: 8,
            borderRadius: token.borderRadius,
          }}
        >
          <Avatar size="small" src={user?.avatar ?? undefined} icon={<UserOutlined />} />

          <Flex vertical style={{ minWidth: 0, lineHeight: 1.25 }}>
            <Typography.Text strong ellipsis style={{ fontSize: token.fontSizeSM }}>
              {user?.displayName ?? user?.email}
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              {user?.role ? ROLE_LABEL[user.role] : null}
            </Typography.Text>
          </Flex>

          <SettingOutlined
            aria-hidden="true"
            style={{ marginLeft: 'auto', color: token.colorTextTertiary }}
          />
        </Flex>
      </Dropdown>

      <Divider style={{ margin: 0 }} />

      <Dropdown
        trigger={['click']}
        placement="topLeft"
        menu={{ items: [{ key: 'empty', label: 'Chưa có thông báo nào', disabled: true }] }}
      >
        <Button block type="text" icon={<BellOutlined />} style={ACTION_BUTTON_STYLE}>
          Thông báo
        </Button>
      </Dropdown>

      <Button
        block
        danger
        type="text"
        icon={<LogoutOutlined />}
        style={ACTION_BUTTON_STYLE}
        onClick={() => void signOut()}
      >
        Đăng xuất
      </Button>

      <Typography.Text
        type="secondary"
        style={{ marginTop: 4, textAlign: 'center', fontSize: token.fontSizeSM }}
      >
        v{env.appVersion}
      </Typography.Text>
    </Flex>
  );
}
