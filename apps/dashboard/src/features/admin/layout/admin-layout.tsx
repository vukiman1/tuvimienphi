import type { ReactNode } from 'react';
import { Layout } from 'antd';
import { Sidebar } from './sidebar';

const CONTENT_PADDING = 24;

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <Layout.Content style={{ padding: CONTENT_PADDING }}>{children}</Layout.Content>
      </Layout>
    </Layout>
  );
}
