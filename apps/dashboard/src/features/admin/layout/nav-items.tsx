import type { ReactNode } from 'react';
import {
  CompassOutlined,
  DashboardOutlined,
  FileTextOutlined,
  NotificationOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { FileRoutesByTo } from '@/routeTree.gen';

export type NavPath = keyof FileRoutesByTo;

export interface NavItem {
  readonly to: NavPath;
  readonly label: string;
  readonly icon: ReactNode;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { to: '/', label: 'Tổng quan', icon: <DashboardOutlined /> },
  { to: '/users', label: 'Người dùng', icon: <TeamOutlined /> },
  { to: '/blog', label: 'Bài viết', icon: <FileTextOutlined /> },
  { to: '/ads', label: 'Quảng cáo', icon: <NotificationOutlined /> },
  { to: '/van-han', label: 'Vận hạn', icon: <CompassOutlined /> },
];

export function isNavPath(value: string): value is NavPath {
  return NAV_ITEMS.some((item) => item.to === value);
}
