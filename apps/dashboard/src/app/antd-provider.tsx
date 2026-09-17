import type { ReactNode } from 'react';
import { App, ConfigProvider, theme as antdTheme } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { useTheme } from '../features/admin/layout/use-theme';

export function AntdProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();

  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#c9a15c',
          colorLink: '#c9a15c',
          borderRadius: 10,
          fontFamily: "'Be Vietnam Pro', system-ui, -apple-system, 'Segoe UI', sans-serif",
        },
      }}
    >
      <App>{children}</App>
    </ConfigProvider>
  );
}
