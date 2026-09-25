import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { App, ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { router } from './app/router';
import { queryClient } from './lib/query-client';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <StrictMode>
    <ConfigProvider locale={viVN}>
      <App>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </App>
    </ConfigProvider>
  </StrictMode>,
);
