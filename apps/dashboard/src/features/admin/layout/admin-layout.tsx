import type { ReactNode } from 'react';
import { Layout } from 'antd';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

const CONTENT_PADDING = 24;

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <Topbar />
        <Layout.Content style={{ paddingInline: CONTENT_PADDING, paddingBottom: CONTENT_PADDING }}>
          {children}
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
