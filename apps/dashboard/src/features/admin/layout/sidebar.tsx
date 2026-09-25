import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Flex, Layout, Menu, Typography } from 'antd';
import { NAV_ITEMS, isNavPath } from './nav-items';
import { SidebarAccount } from './sidebar-account';

const SIDER_WIDTH = 224;
const BACKDROP_HEIGHT = 520;
const BACKDROP_OPACITY = 0.45;
const BACKDROP_FADE = 'linear-gradient(to bottom, transparent 0%, black 45%)';

export function Sidebar() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <Layout.Sider
      width={SIDER_WIDTH}
      theme="light"
      breakpoint="lg"
      collapsedWidth={0}
      style={{ position: 'relative', overflow: 'hidden' }}
      styles={{ body: { display: 'flex', flexDirection: 'column', height: '100%' } }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          insetInline: 0,
          bottom: 0,
          height: BACKDROP_HEIGHT,
          backgroundImage: 'url(/sidebar-backdrop.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          opacity: BACKDROP_OPACITY,
          maskImage: BACKDROP_FADE,
          WebkitMaskImage: BACKDROP_FADE,
          pointerEvents: 'none',
        }}
      />

      <Flex align="center" justify="center" style={{ position: 'relative', height: 64 }}>
        <Typography.Title level={5} style={{ margin: 0 }}>
          Tử Vi
        </Typography.Title>
      </Flex>

      <Menu
        style={{ position: 'relative', flex: 1, background: 'transparent' }}
        mode="inline"
        selectedKeys={[pathname]}
        items={NAV_ITEMS.map(({ to, label, icon }) => ({ key: to, label, icon }))}
        onClick={({ key }) => {
          if (isNavPath(key)) {
            void navigate({ to: key });
          }
        }}
      />

      <SidebarAccount />
    </Layout.Sider>
  );
}
