import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { ExportOutlined } from '@ant-design/icons';
import { Button, Flex, Layout, Menu, Tooltip } from 'antd';
import { env } from '@/config/env';
import { NAV_ITEMS, activeNavPath, isNavPath } from './nav-items';
import { SidebarAccount } from './sidebar-account';

const SIDER_WIDTH = 224;
const BACKDROP_HEIGHT = 520;
const BACKDROP_OPACITY = 0.45;
const BACKDROP_FADE = 'linear-gradient(to bottom, transparent 0%, black 45%)';
const LOGO_HEIGHT = 32;
const CLIENT_LINK_LABEL = 'Xem trang web';

export function Sidebar() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const activePath = activeNavPath(pathname);

  return (
    <Layout.Sider
      width={SIDER_WIDTH}
      theme="light"
      breakpoint="lg"
      collapsedWidth={0}
      style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'hidden',
      }}
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

      <Flex align="center" justify="center" gap={8} style={{ position: 'relative', height: 64 }}>
        <Link to="/">
          <img src="/brand/logo.png" alt="Tử Vi" height={LOGO_HEIGHT} />
        </Link>
        <Tooltip title={CLIENT_LINK_LABEL}>
          <Button
            type="text"
            size="small"
            icon={<ExportOutlined />}
            href={env.clientUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={CLIENT_LINK_LABEL}
          />
        </Tooltip>
      </Flex>

      <Menu
        style={{ position: 'relative', flex: 1, background: 'transparent' }}
        mode="inline"
        selectedKeys={activePath ? [activePath] : []}
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
