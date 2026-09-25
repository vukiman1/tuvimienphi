import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Flex, Layout, Menu, Typography } from 'antd';
import { NAV_ITEMS, isNavPath } from './nav-items';

const SIDER_WIDTH = 224;

export function Sidebar() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <Layout.Sider width={SIDER_WIDTH} theme="light" breakpoint="lg" collapsedWidth={0}>
      <Flex align="center" justify="center" style={{ height: 64 }}>
        <Typography.Title level={5} style={{ margin: 0 }}>
          Tử Vi
        </Typography.Title>
      </Flex>

      <Menu
        mode="inline"
        selectedKeys={[pathname]}
        items={NAV_ITEMS.map(({ to, label, icon }) => ({ key: to, label, icon }))}
        onClick={({ key }) => {
          if (isNavPath(key)) {
            void navigate({ to: key });
          }
        }}
      />
    </Layout.Sider>
  );
}
