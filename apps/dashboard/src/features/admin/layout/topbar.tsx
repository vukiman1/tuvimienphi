import { useNavigate } from '@tanstack/react-router';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, Flex, Layout, Typography } from 'antd';
import { resetAuthBootstrap } from '@/features/auth/bootstrap';
import { LOGIN_PATH } from '@/features/auth/route-guards';
import { authService } from '@/services/auth-service';
import { selectUser, useAuthStore } from '@/stores/auth-store';

enum UserMenuKey {
  Profile = 'profile',
  SignOut = 'sign-out',
}

export function Topbar() {
  const navigate = useNavigate();
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
    <Layout.Header style={{ background: 'transparent', paddingInline: 24 }}>
      <Flex align="center" justify="end" style={{ height: '100%' }}>
        <Dropdown
          trigger={['click']}
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
          <Flex align="center" gap={8} style={{ cursor: 'pointer' }}>
            <Avatar src={user?.avatar ?? undefined} icon={<UserOutlined />} />
            <Typography.Text>{user?.displayName ?? user?.email}</Typography.Text>
          </Flex>
        </Dropdown>
      </Flex>
    </Layout.Header>
  );
}
